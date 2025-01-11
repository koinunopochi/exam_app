import React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { Question } from '@/types/question';
import { SingleChoiceAnswer } from '../answers/SingleChoiceAnswer';
import { MultipleChoiceAnswer } from '../answers/MultipleChoiceAnswer';
import { TextAnswer } from '../answers/TextAnswer';
import { FillInAnswer } from '../answers/FillInAnswer';
import { SortAnswer } from '../answers/SortAnswer';

interface QuestionResultProps {
  question: Question;
  answers: any;
  correctAnswers: any;
  result: {
    needsManualGrading: boolean;
    isCorrect: boolean;
    earnedPoints: number;
    possiblePoints: number;
  };
  index: number;
}

export const QuestionResult: React.FC<QuestionResultProps> = ({
  question,
  answers,
  correctAnswers,
  result,
  index,
}) => {
  return (
    <Collapsible>
      <div className="p-4 border rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <CollapsibleTrigger className="flex items-center space-x-2 hover:opacity-80">
            <ChevronRight className="w-4 h-4" />
            <div className="text-left">
              <h5 className="font-medium">問題 {index + 1}</h5>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {question.text}
              </p>
            </div>
          </CollapsibleTrigger>
          <div className="flex items-center space-x-2">
            {result.needsManualGrading ? (
              <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-sm">
                手動採点
              </span>
            ) : result.isCorrect ? (
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-sm">
                正解
              </span>
            ) : (
              <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-sm">
                不正解
              </span>
            )}
            <span className="text-sm">
              {result.earnedPoints} / {result.possiblePoints} 点
            </span>
          </div>
        </div>

        <CollapsibleContent className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h6 className="font-medium">問題文:</h6>
              <p className="text-sm bg-secondary/50 p-3 rounded-md">
                {question.text}
              </p>
            </div>

            {question.type === 'single-choice' && (
              <SingleChoiceAnswer
                question={question}
                answers={answers}
                correctAnswers={correctAnswers}
              />
            )}
            {question.type === 'multiple-choice' && (
              <MultipleChoiceAnswer
                question={question}
                answers={answers}
                correctAnswers={correctAnswers}
              />
            )}
            {question.type === 'text' && (
              <TextAnswer
                question={question}
                answers={answers}
                correctAnswers={correctAnswers}
              />
            )}
            {question.type === 'fill-in' && (
              <FillInAnswer
                question={question}
                answers={answers}
                correctAnswers={correctAnswers}
              />
            )}
            {question.type === 'sort' && (
              <SortAnswer
                question={question}
                answers={answers}
                correctAnswers={correctAnswers}
              />
            )}

            {correctAnswers?.answers[question.id]?.explanation && (
              <div className="space-y-2">
                <h6 className="font-medium">解説:</h6>
                <div className="bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm">
                    {correctAnswers.answers[question.id].explanation}
                  </p>
                </div>
              </div>
            )}
            {result.needsManualGrading && (
              <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                この問題は手動採点のため、最終的な得点は採点者の評価により変更される可能性があります。
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
