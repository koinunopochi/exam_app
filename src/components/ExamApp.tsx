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
import { useExamAnswers } from './exam-taking/hooks/useExamAnswers';
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

  const {
    questions,
    timeLimit: initialTimeLimit,
    errorMessage,
    loadExamData,
  } = useExamData(examId);

  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    saveAnswer,
    getUnansweredCount,
    getAnsweredCount,
  } = useExamAnswers(questions);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const showFinishConfirmation = () => {
    const unansweredCount = getUnansweredCount();
    if (unansweredCount > 0) {
      if (
        !confirm(
          `未回答の問題が${unansweredCount}問あります。\n` +
            `全${
              questions.length
            }問中${getAnsweredCount()}問が回答済みです。\n` +
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
