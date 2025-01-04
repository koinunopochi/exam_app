import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChoiceQuestion, ChoiceAnswer } from '@/types/question';

interface SingleChoiceQuestionProps {
  question: ChoiceQuestion;
  answer?: ChoiceAnswer;
  onAnswer: (answer: ChoiceAnswer) => void;
}

export const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  question,
  answer,
  onAnswer,
}) => {
  return (
    <RadioGroup
      value={answer?.selectedOptions?.[0] || ''}
      onValueChange={(value) =>
        onAnswer({ type: 'single-choice', selectedOptions: [value] })
      }
      className="space-y-2"
    >
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <RadioGroupItem value={option.id} id={option.id} />
          <Label htmlFor={option.id}>{option.text}</Label>
        </div>
      ))}
    </RadioGroup>
  );
};
