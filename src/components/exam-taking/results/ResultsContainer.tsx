// ResultsContainer.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionResultsList } from './QuestionResultsList';
import { ExamCompletionDialogs } from '../ExamCompletionDialogs';
import { ExamScore } from './ExamScore';

interface ResultsContainerProps {
  examResult: {
    earnedPoints: number;
    percentage: number;
    totalPoints: number;
    questionResults: { [key: string]: any };
  };
  questions: any[];
  answers: { [key: string]: any };
  correctAnswers: any;
}

export const ResultsContainer = ({
  examResult,
  questions,
  answers,
  correctAnswers,
}: ResultsContainerProps) => {
  if (!examResult) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>試験完了</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExamCompletionDialogs />

        <div className="space-y-6">
          <ExamScore
            earnedPoints={examResult.earnedPoints}
            percentage={examResult.percentage}
            totalPoints={examResult.totalPoints}
          />

          <QuestionResultsList
            questions={questions}
            answers={answers}
            correctAnswers={correctAnswers}
            questionResults={examResult.questionResults}
          />
        </div>
      </CardContent>
    </Card>
  );
};
