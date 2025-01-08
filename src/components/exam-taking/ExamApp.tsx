import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { ExamStartForm } from './ExamStartForm';
import { ExamConfirmation } from './ExamConfirmation';
import { ExamContainer } from './exam';
import { ResultsContainer } from './results';

import { useExamState } from './hooks/useExamState';
import { useExamAnswers } from './hooks/useExamAnswers';
import { useExamFinish } from './hooks/useExamFinish';
import { useExamTimer } from './hooks/useExamTimer';
import { useExamData } from './hooks/useExamData';
import { useExamGrading } from './hooks/useExamGrading';

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

  const { timeLimit, handleTimeUp } = useExamTimer(initialTimeLimit, () => {
    alert('制限時間が終了しました。試験を終了します。');
    finishExam();
  });

  const { examResult, correctAnswers, gradeExam } = useExamGrading(questions);

  const {
    showConfirmDialog,
    setShowConfirmDialog,
    showFinishConfirmation,
    finishExam,
  } = useExamFinish({
    examId,
    username,
    answers,
    gradeExam,
    questionsCount: questions.length,
    getUnansweredCount,
    getAnsweredCount,
    onComplete: () => setExamState('complete'),
  });

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
