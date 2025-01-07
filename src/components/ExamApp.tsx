import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { ExamContainer } from './exam-taking/exam';
import { ResultsContainer } from './exam-taking/results';

// 試験の状態を管理する型
type ExamState = 'init' | 'confirm' | 'exam' | 'complete';

import { useExamTimer } from './exam-taking/hooks/useExamTimer';
import { useExamData } from './exam-taking/hooks/useExamData';

const ExamApp = () => {
  const [searchParams] = useSearchParams();
  const [examState, setExamState] = useState<ExamState>('init');
  const [examId, setExamId] = useState(searchParams.get('exam_id') || '');
  const [username, setUsername] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [correctAnswers, setCorrectAnswers] = useState<any>(null);
  const [examStartTime, setExamStartTime] = useState<number>(0);
  const {
    questions,
    timeLimit: initialTimeLimit,
    errorMessage,
    loadExamData,
  } = useExamData(examId);
  const { timeLimit, handleTimeUp } = useExamTimer(initialTimeLimit, () => {
    alert('制限時間が終了しました。試験を終了します。');
    finishExam();
  });

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
          <ExamContainer
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onAnswer={saveAnswer}
            onNavigate={setCurrentQuestionIndex}
            onFinish={showFinishConfirmation}
            timeLimit={timeLimit}
            examStartTime={examStartTime}
            onTimeUp={handleTimeUp}
          />
        );

      case 'complete':
        return (
          <ResultsContainer
            answers={answers}
            correctAnswers={correctAnswers}
            examResult={examResult}
            questions={questions}
          />
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
