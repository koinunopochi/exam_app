/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { SortQuestion } from '@/types/question';

interface SortAnswerProps {
  question: SortQuestion;
  answers: any;
  correctAnswers: any;
}

export const SortAnswer: React.FC<SortAnswerProps> = ({
  question,
  answers,
  correctAnswers,
}) => {
  return (
    <div className="space-y-2">
      <h6 className="font-medium">並び替え結果:</h6>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-2">あなたの回答:</p>
          <div className="space-y-1">
            {(answers[question.id]?.order || []).map((id: any, index: any) => (
              <div key={index} className="bg-gray-50 p-2 rounded-md text-sm">
                {index + 1}. {question.items[parseInt(id)]}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">正しい順序:</p>
          <div className="space-y-1">
            {correctAnswers?.answers[question.id]?.correctOrder.map(
              (id: any, index: any) => (
                <div key={index} className="bg-blue-50 p-2 rounded-md text-sm">
                  {index + 1}. {question.items[parseInt(id)]}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
