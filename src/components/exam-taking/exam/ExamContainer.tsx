// ExamContainer.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExamNavigation } from './ExamNavigation';
import { ExamStatusBar } from './ExamStatusBar';
import { QuestionRenderer } from '../QuestionRenderer';

interface ExamContainerProps {
  questions: any[];
  currentQuestionIndex: number;
  answers: { [key: string]: any };
  onAnswer: (questionId: string, answer: any) => void;
  onNavigate: (index: number) => void;
  onFinish: () => void;
  timeLimit?: number;
  examStartTime: number;
  onTimeUp: () => void;
}

export const ExamContainer = ({
  questions,
  currentQuestionIndex,
  answers,
  onAnswer,
  onNavigate,
  onFinish,
  timeLimit,
  examStartTime,
  onTimeUp,
}: ExamContainerProps) => {
  if (!questions.length) return null;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-4">
      <ExamStatusBar
        timeLimit={timeLimit}
        onTimeUp={onTimeUp}
        examStartTime={examStartTime}
      />
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              問題 {currentQuestionIndex + 1} / {questions.length}
            </CardTitle>
            <Button variant="outline" onClick={onFinish}>
              終了する
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-lg mb-4">{currentQuestion.text}</p>
              <QuestionRenderer
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswer={(answer) => onAnswer(currentQuestion.id, answer)}
              />
            </div>
            <ExamNavigation
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              onNavigate={onNavigate}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


