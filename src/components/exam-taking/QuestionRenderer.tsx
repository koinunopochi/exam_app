/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { SingleChoiceQuestion } from './questions/SingleChoiceQuestion';
import { MultipleChoiceQuestion } from './questions/MultipleChoiceQuestion';
import { TextQuestion } from './questions/TextQuestion';
import { FillInQuestion } from './questions/FillInQuestion';
import { SortQuestion } from './questions/SortQuestion';
import { Question, QuestionAnswer } from '@/types/question';

interface QuestionRendererProps {
  question: Question;
  answer?: QuestionAnswer;
  onAnswer: (answer: QuestionAnswer) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onAnswer,
}) => {
  switch (question.type) {
    case 'single-choice':
      return (
        <SingleChoiceQuestion
          question={question}
          answer={answer as any}
          onAnswer={onAnswer}
        />
      );

    case 'multiple-choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          answer={answer as any}
          onAnswer={onAnswer}
        />
      );

    case 'text':
      return (
        <TextQuestion
          question={question}
          answer={answer as any}
          onAnswer={onAnswer}
        />
      );

    case 'fill-in':
      return (
        <FillInQuestion
          question={question}
          answer={answer as any}
          onAnswer={onAnswer}
        />
      );

    case 'sort':
      return (
        <SortQuestion
          question={question}
          answer={answer as any}
          onAnswer={onAnswer}
        />
      );

    default:
      return <p>未対応の問題形式です</p>;
  }
};
