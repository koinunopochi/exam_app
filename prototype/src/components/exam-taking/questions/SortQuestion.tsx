import React from 'react';
import { Button } from '@/components/ui/button';
import { SortQuestion as SortQuestionType, SortAnswer } from '@/types/question';

interface SortQuestionProps {
  question: SortQuestionType;
  answer?: SortAnswer;
  onAnswer: (answer: SortAnswer) => void;
}

export const SortQuestion: React.FC<SortQuestionProps> = ({
  question,
  answer,
  onAnswer,
}) => {
  // インデックスの配列を初期化（0から始まる連番）
  const currentOrder =
    answer?.order || question.items.map((_, index) => index.toString());

  return (
    <div className="space-y-2">
      {currentOrder.map((itemId, index) => {
        const item = question.items[parseInt(itemId)];
        return (
          <div
            key={itemId}
            className="flex items-center space-x-2 bg-secondary p-2 rounded"
          >
            <span className="text-sm text-muted-foreground">{index + 1}.</span>
            <span>{item}</span>
            <div className="ml-auto space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => {
                  const newOrder = [...currentOrder];
                  [newOrder[index], newOrder[index - 1]] = [
                    newOrder[index - 1],
                    newOrder[index],
                  ];
                  onAnswer({ type: 'sort', order: newOrder });
                }}
              >
                ↑
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={index === currentOrder.length - 1}
                onClick={() => {
                  const newOrder = [...currentOrder];
                  [newOrder[index], newOrder[index + 1]] = [
                    newOrder[index + 1],
                    newOrder[index],
                  ];
                  onAnswer({ type: 'sort', order: newOrder });
                }}
              >
                ↓
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
