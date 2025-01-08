// QuestionResultsList.tsx
import { QuestionResult } from './QuestionResult';

interface QuestionResultsListProps {
  questions: any[];
  answers: { [key: string]: any };
  correctAnswers: any;
  questionResults: { [key: string]: any };
}

export const QuestionResultsList = ({
  questions,
  answers,
  correctAnswers,
  questionResults,
}: QuestionResultsListProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">問題別の結果</h4>
      {questions.map((question, index) => {
        const result = questionResults[question.id];
        if (!result) return null;
        return (
          <QuestionResult
            key={question.id}
            question={question}
            answers={answers}
            correctAnswers={correctAnswers}
            result={result}
            index={index}
          />
        );
      })}
    </div>
  );
};
