import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { TextQuestion as TextQuestionType, TextAnswer } from '@/types/question';

interface TextQuestionProps {
  question: TextQuestionType;
  answer?: TextAnswer;
  onAnswer: (answer: TextAnswer) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  answer,
  onAnswer,
}) => {
  return (
    <div className="space-y-2">
      {question.textType === 'long' ? (
        <Textarea
          value={answer?.text || ''}
          onChange={(e) => onAnswer({ type: 'text', text: e.target.value })}
          placeholder="回答を入力してください"
          className="min-h-[200px]"
        />
      ) : (
        <Input
          value={answer?.text || ''}
          onChange={(e) => onAnswer({ type: 'text', text: e.target.value })}
          placeholder="回答を入力してください"
        />
      )}
    </div>
  );
};
