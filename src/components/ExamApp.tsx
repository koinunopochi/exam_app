import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { createSecureZip } from '@/utils/crypto';
import { ExamStartForm } from './exam-taking/ExamStartForm';
import { ExamConfirmation } from './exam-taking/ExamConfirmation';
import { QuestionRenderer } from './exam-taking/QuestionRenderer';
import { ExamCompletionDialogs } from './exam-taking/ExamCompletionDialogs';
import { QuestionResult } from './exam-taking/answers/QuestionResult';
import ExamTimer from './exam-taking/ExamTimer';
import ExamScore from './exam-taking/ExamScore';

// 試験の状態を管理する型
type ExamState = 'init' | 'confirm' | 'exam' | 'complete';

const ExamApp = () => {
  const [searchParams] = useSearchParams();
  const [examState, setExamState] = useState<ExamState>('init');
  const [examId, setExamId] = useState(searchParams.get('exam_id') || '');
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [correctAnswers, setCorrectAnswers] = useState<any>(null);
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [examStartTime, setExamStartTime] = useState<number>(0);
 const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initializeAnswers = (questions: any[]) => {
    const initialAnswers = {};
    questions.forEach((question) => {
      switch (question.type) {
        case 'single-choice':
        case 'multiple-choice':
          initialAnswers[question.id] = {
            type: question.type,
            selectedOptions: [],
            timestamp: Date.now(),
          };
          break;
        case 'text':
          initialAnswers[question.id] = {
            type: question.type,
            text: '',
            timestamp: Date.now(),
          };
          break;
        case 'fill-in':
          initialAnswers[question.id] = {
            type: question.type,
            answers: {},
            timestamp: Date.now(),
          };
          break;
        case 'sort':
          // 並び替え問題の初期順序をランダム化
          initialAnswers[question.id] = {
            type: question.type,
            order: shuffleArray(
              [...question.items.keys()].map((i) => i.toString())
            ),
            timestamp: Date.now(),
          };
          break;
      }
    });
    return initialAnswers;
  };

  // 配列をランダムに並び替える関数
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // 試験データを読み込む
  const loadExamData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/exams/${examId}/questions.json`
      );
      if (!response.ok) {
        setErrorMessage(
          '試験データの取得に失敗しました。\n試験IDが正しいか確認してください。'
        );
        return false;
      }
      const data: any = await response.json();
      setQuestions(data.questions);
      setTimeLimit(data.time_limit);
      setErrorMessage(null);
      // 問題データ読み込み後に初期回答状態を設定
      setAnswers(initializeAnswers(data.questions));
      return true;
    } catch (error) {
      console.error('Error loading exam:', error);
      setErrorMessage(
        '試験データの取得中にエラーが発生しました。\n試験IDが正しいか確認してください。'
      );
      return false;
    }
  };

  // 制限時間切れの処理を追加
  const handleTimeUp = () => {
    alert('制限時間が終了しました。試験を終了します。');
    setTimeLimit(undefined);
    finishExam();
  };

  // 試験開始の確認
  const handleStartConfirm = async () => {
    if (!examId.trim() || !username.trim()) {
      alert('試験IDとユーザー名を入力してください');
      return;
    }
    const success = await loadExamData();
    if (success) {
      setExamState('confirm');
    }
  };

  // 回答の保存
  const saveAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...answer,
        timestamp: Date.now(),
      },
    }));
  };

  // 回答状態をチェックする関数
  const isAnswered = (answer: any): boolean => {
    if (!answer) return false;

    switch (answer.type) {
      case 'single-choice':
      case 'multiple-choice':
        return (
          Array.isArray(answer.selectedOptions) &&
          answer.selectedOptions.length > 0
        );

      case 'text':
        return answer.text !== undefined && answer.text.trim() !== '';

      case 'fill-in':
        return (
          answer.answers &&
          Object.values(answer.answers).some(
            (a: any) => a && typeof a === 'string' && a.trim() !== ''
          )
        );

      case 'sort':
        return Array.isArray(answer.order) && answer.order.length > 0;

      default:
        return false;
    }
  };

  const showFinishConfirmation = () => {
    const unansweredCount = questions.reduce((count, question) => {
      const answer = answers[question.id];
      return count + (isAnswered(answer) ? 0 : 1);
    }, 0);

    if (unansweredCount > 0) {
      if (
        !confirm(
          `未回答の問題が${unansweredCount}問あります。\n` +
            `全${questions.length}問中${
              questions.length - unansweredCount
            }問が回答済みです。\n` +
            `終了してもよろしいですか？`
        )
      ) {
        return;
      }
    }
    setShowConfirmDialog(true);
  };

  // 採点用の回答状態チェック関数
  const validateAnswer = (answer: any, question: any): any => {
    if (!answer) return null;

    switch (question.type) {
      case 'single-choice':
      case 'multiple-choice':
        if (!Array.isArray(answer.selectedOptions)) {
          return { ...answer, selectedOptions: [] };
        }
        break;

      case 'text':
        if (typeof answer.text !== 'string') {
          return { ...answer, text: '' };
        }
        break;

      case 'fill-in':
        if (!answer.answers || typeof answer.answers !== 'object') {
          return { ...answer, answers: {} };
        }
        break;

      case 'sort':
        if (!Array.isArray(answer.order)) {
          return {
            ...answer,
            order: [...Array(question.items.length).keys()].map(String),
          };
        }
        break;
    }
    return answer;
  };

  // 採点を実行する関数
  const gradeExam = async (answers: any, correctAnswers: any) => {
    let totalPoints = 0;
    let earnedPoints = 0;
    const questionResults = {};

    for (const question of questions) {
      const answer = validateAnswer(answers[question.id], question);
      const correct = correctAnswers[question.id];

      // 回答が未設定の場合も採点対象に含める
      if (!answer) {
        totalPoints += question.points;
        questionResults[question.id] = {
          isCorrect: false,
          earnedPoints: 0,
          possiblePoints: question.points,
          needsManualGrading: question.gradingType === 'manual',
          notAnswered: true, // 未回答フラグを追加
        };
        continue;
      }

      if (!correct) continue;

      totalPoints += question.points;
      let isCorrect = false;
      let partialPoints = 0;

      switch (question.type) {
        case 'single-choice':
          isCorrect = answer.selectedOptions[0] === correct.correctOptions[0];
          partialPoints = isCorrect ? question.points : 0;
          break;

        case 'multiple-choice': {
          const selectedSet = new Set(answer.selectedOptions);
          const correctSet = new Set(correct.correctOptions);
          isCorrect =
            selectedSet.size === correctSet.size &&
            [...selectedSet].every((opt) => correctSet.has(opt));
          partialPoints = isCorrect ? question.points : 0;
          break;
        }

        case 'text':
          if (question.gradingType === 'auto') {
            const answerText = answer.text.trim();
            const correctText = correct.correctAnswer.trim();
            isCorrect = correct.caseSensitive
              ? answerText === correctText
              : answerText.toLowerCase() === correctText.toLowerCase();
            partialPoints = isCorrect ? question.points : 0;
          } else {
            partialPoints = 0; // 手動採点の場合は0点とする
          }
          break;

        case 'fill-in': {
          if (Object.keys(correct.answers).length === 0) {
            partialPoints = 0;
            break;
          }
          let correctBlanks = 0;
          const totalBlanks = Object.keys(correct.answers).length;
          Object.entries(correct.answers).forEach(
            ([key, value]: [string, any]) => {
              const userAnswer = answer.answers[key]?.trim() || '';
              const correctAnswer = value.answer.trim();
              if (value.caseSensitive) {
                if (userAnswer === correctAnswer) correctBlanks++;
              } else {
                if (userAnswer.toLowerCase() === correctAnswer.toLowerCase())
                  correctBlanks++;
              }
            }
          );
          partialPoints = (correctBlanks / totalBlanks) * question.points;
          isCorrect = correctBlanks === totalBlanks;
          break;
        }

        case 'sort':
          isCorrect =
            JSON.stringify(answer.order) ===
            JSON.stringify(correct.correctOrder);
          partialPoints = isCorrect ? question.points : 0;
          break;
      }

      earnedPoints += partialPoints;
      questionResults[question.id] = {
        isCorrect,
        earnedPoints: partialPoints,
        possiblePoints: question.points,
        needsManualGrading: question.gradingType === 'manual',
        notAnswered: false,
      };
    }

    return {
      totalPoints,
      earnedPoints,
      percentage: totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0,
      questionResults,
      answeredCount: Object.values(answers).filter((a) => a !== null).length,
      totalQuestions: questions.length,
    };
  };

  // 試験を終了し結果を暗号化
  const finishExam = async () => {
    const examData = {
      examId,
      username,
      timestamp: Date.now(),
      answers,
      metadata: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
    };

    try {
      // 正解データを取得
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/exams/${examId}/answers.json`
      );
      if (!response.ok) throw new Error('Failed to load answers');
      const answersData = await response.json();
      setCorrectAnswers(answersData);

      // 採点を実行
      const result = await gradeExam(answers, answersData.answers);
      setExamResult(result);

      // 結果データを含めて暗号化・ZIP化
      const finalData = {
        ...examData,
        result,
        correctAnswers: answersData,
      };

      const zipBlob = await createSecureZip(finalData);

      // ZIPファイルのダウンロード
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam_result_${examId}_${username}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExamState('complete');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error processing exam data:', error);
      alert('結果の処理中にエラーが発生しました');
    }
  };

  // 現在の状態に応じたコンポーネントをレンダリング
  const renderContent = () => {
    switch (examState) {
      case 'init':
        return (
          <ExamStartForm
            examId={examId}
            username={username}
            onExamIdChange={setExamId}
            onUsernameChange={setUsername}
            onSubmit={handleStartConfirm}
          />
        );

      case 'confirm':
        return (
          <ExamConfirmation
            examId={examId}
            username={username}
            questionCount={questions.length}
            onBack={() => setExamState('init')}
            onStart={() => {
              setExamStartTime(Date.now());
              setExamState('exam');
            }}
            timeLimit={timeLimit}
          />
        );

      case 'exam':
        if (!questions.length) return null;
        return (
          <div className="space-y-4">
            <ExamTimer
              timeLimit={timeLimit}
              onTimeUp={handleTimeUp}
              examStartTime={examStartTime}
            />
            <Card className="w-full max-w-3xl mx-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    問題 {currentQuestionIndex + 1} / {questions.length}
                  </CardTitle>
                  <Button variant="outline" onClick={showFinishConfirmation}>
                    終了する
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <p className="text-lg mb-4">
                      {questions[currentQuestionIndex].text}
                    </p>
                    <QuestionRenderer
                      question={questions[currentQuestionIndex]}
                      answer={answers[questions[currentQuestionIndex].id]}
                      onAnswer={(answer) =>
                        saveAnswer(questions[currentQuestionIndex].id, answer)
                      }
                    />
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      disabled={currentQuestionIndex === 0}
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => prev - 1)
                      }
                    >
                      前の問題
                    </Button>
                    <Button
                      disabled={currentQuestionIndex === questions.length - 1}
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => prev + 1)
                      }
                    >
                      次の問題
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'complete':
        return (
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>試験完了</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ExamCompletionDialogs />

              {examResult && (
                <div className="space-y-6">
                  <ExamScore
                    earnedPoints={examResult.earnedPoints}
                    percentage={examResult.percentage}
                    totalPoints={examResult.totalPoints}
                  />

                  <div className="space-y-4">
                    <h4 className="font-semibold">問題別の結果</h4>
                    {questions.map((question, index) => {
                      const result = examResult.questionResults[question.id];
                      if (!result) return null;
                      return (
                        <QuestionResult
                          answers={answers}
                          correctAnswers={correctAnswers}
                          index={index}
                          question={question}
                          result={result}
                          key={question.id}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      {errorMessage && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      {renderContent()}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>試験を終了しますか？</DialogTitle>
          </DialogHeader>
          <p>終了すると回答内容を変更できなくなります。 よろしいですか？</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              キャンセル
            </Button>
            <Button onClick={finishExam}>終了する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamApp;
