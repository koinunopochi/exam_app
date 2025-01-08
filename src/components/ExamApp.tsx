import { useState } from 'react';
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

import { useExamState } from './exam-taking/hooks/useExamState';
import { useExamTimer } from './exam-taking/hooks/useExamTimer';
import { useExamData } from './exam-taking/hooks/useExamData';
import { useExamGrading } from './exam-taking/hooks/useExamGrading';

const ExamApp = () => {
  const {
    examState,
    setExamState,
    examId,
    setExamId,
    username,
    setUsername,
    examStartTime,
    handleStartConfirm,
    startExam,
  } = useExamState();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const { examResult, correctAnswers, gradeExam } = useExamGrading(questions);

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
      const result = await gradeExam(examId, answers);
      const finalData = {
        ...examData,
        result,
        correctAnswers,
      };

      const zipBlob = await createSecureZip(finalData);
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
            onSubmit={() => handleStartConfirm(loadExamData)}
          />
        );

      case 'confirm':
        return (
          <ExamConfirmation
            examId={examId}
            username={username}
            questionCount={questions.length}
            onBack={() => setExamState('init')}
            onStart={startExam}
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
