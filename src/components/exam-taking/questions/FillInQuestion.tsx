import React from 'react';
import { Input } from '@/components/ui/input';
import {
  FillInQuestion as FillInQuestionType,
  FillInAnswer,
} from '@/types/question';

interface FillInQuestionProps {
  question: FillInQuestionType;
  answer?: FillInAnswer;
  onAnswer: (answer: FillInAnswer) => void;
}

export const FillInQuestion: React.FC<FillInQuestionProps> = ({
  question,
  answer,
  onAnswer,
}) => {
  if (!question.textWithBlanks) return <p>問題の設定が不完全です</p>;

  const parts = question.textWithBlanks.split(/(\{[0-9]+\})/);

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        const match = part.match(/\{([0-9]+)\}/);
        if (match) {
          const blankNumber = match[1];
          return (
            <Input
              key={index}
              value={answer?.answers?.[blankNumber] || ''}
              onChange={(e) => {
                const currentAnswers = answer?.answers || {};
                onAnswer({
                  type: 'fill-in',
                  answers: {
                    ...currentAnswers,
                    [blankNumber]: e.target.value,
                  },
                });
              }}
              className="inline-block w-32 mx-2"
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};
