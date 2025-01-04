/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FillInQuestion } from '@/types/question';

interface FillInAnswerProps {
  question: FillInQuestion;
  answers: any;
  correctAnswers: any;
}

export const FillInAnswer: React.FC<FillInAnswerProps> = ({
  question,
  answers,
  correctAnswers,
}) => {
  return (
    <div className="space-y-2">
      <h6 className="font-medium">回答:</h6>
      {Object.entries(answers[question.id]?.answers || {}).map(
        ([num, value]: [string, any]) => (
          <div key={num} className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium">空欄{num}:</p>
            <div className="flex items-center space-x-4 mt-1">
              <div>
                <p className="text-sm text-muted-foreground">あなたの回答:</p>
                <p className="text-sm">{value}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">正解:</p>
                <p className="text-sm">
                  {correctAnswers?.answers[question.id]?.answers[num]?.answer}
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
