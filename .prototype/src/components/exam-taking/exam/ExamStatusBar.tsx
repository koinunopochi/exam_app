import ExamTimer from "../ExamTimer";

interface ExamStatusBarProps {
  timeLimit?: number;
  examStartTime: number;
  onTimeUp: () => void;
}

export const ExamStatusBar = ({
  timeLimit,
  examStartTime,
  onTimeUp,
}: ExamStatusBarProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <ExamTimer
        timeLimit={timeLimit}
        onTimeUp={onTimeUp}
        examStartTime={examStartTime}
      />
    </div>
  );
};
