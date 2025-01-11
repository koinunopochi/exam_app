/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ChoiceQuestion } from '@/types/question';

interface MultipleChoiceAnswerProps {
  question: ChoiceQuestion;
  answers: any;
  correctAnswers: any;
}

export const MultipleChoiceAnswer: React.FC<MultipleChoiceAnswerProps> = ({
  question,
  answers,
  correctAnswers,
}) => {
  return (
    <div className="space-y-2">
      <h6 className="font-medium">選択肢と回答:</h6>
      <div className="space-y-1">
        {question.options.map((opt) => {
          const isSelected = answers[question.id]?.selectedOptions?.includes(
            opt.id
          );
          const isCorrect = correctAnswers?.answers[
            question.id
          ]?.correctOptions?.includes(opt.id);

          return (
            <div
              key={opt.id}
              className={`flex items-center p-2 rounded-md ${
                isSelected && isCorrect
                  ? 'bg-green-100'
                  : isSelected && !isCorrect
                  ? 'bg-red-100'
                  : !isSelected && isCorrect
                  ? 'bg-blue-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2 flex-1">
                {isSelected ? '✓' : '○'}
                <span className={isSelected ? 'font-medium' : ''}>
                  {opt.text}
                </span>
              </div>
              {isCorrect && (
                <span className="text-green-600 text-sm">正解に含まれる</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
