/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { TextQuestion } from '@/types/question';

interface TextAnswerProps {
  question: TextQuestion;
  answers: any;
  correctAnswers: any;
}

export const TextAnswer: React.FC<TextAnswerProps> = ({
  question,
  answers,
  correctAnswers,
}) => {
  return (
    <div className="space-y-2">
      <h6 className="font-medium">回答:</h6>
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm font-medium">あなたの回答:</p>
        <p className="text-sm mt-1">{answers[question.id]?.text || '未回答'}</p>
      </div>
      {question.gradingType === 'auto' && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm font-medium">正解の回答:</p>
          <p className="text-sm mt-1">
            {correctAnswers?.answers[question.id]?.correctAnswer}
          </p>
          {correctAnswers?.answers[question.id]?.caseSensitive && (
            <p className="text-xs text-gray-600 mt-1">
              ※大文字小文字は区別されます
            </p>
          )}
        </div>
      )}
    </div>
  );
};
