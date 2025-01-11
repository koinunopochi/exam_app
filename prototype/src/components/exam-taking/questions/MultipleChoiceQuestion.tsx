import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChoiceQuestion, ChoiceAnswer } from '@/types/question';

interface MultipleChoiceQuestionProps {
  question: ChoiceQuestion;
  answer?: ChoiceAnswer;
  onAnswer: (answer: ChoiceAnswer) => void;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  answer,
  onAnswer,
}) => {
  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={option.id}
            checked={(answer?.selectedOptions || []).includes(option.id)}
            onCheckedChange={(checked) => {
              const currentSelected = answer?.selectedOptions || [];
              const newSelected = checked
                ? [...currentSelected, option.id]
                : currentSelected.filter((id) => id !== option.id);
              onAnswer({
                type: 'multiple-choice',
                selectedOptions: newSelected,
              });
            }}
          />
          <Label htmlFor={option.id}>{option.text}</Label>
        </div>
      ))}
    </div>
  );
};
