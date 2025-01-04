import { Question, QuestionType } from '@/types/question';
import { Card, CardContent } from '../ui/card';
import { Collapsible, CollapsibleContent } from '../ui/collapsible';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useState } from 'react';

export const QuestionCard = ({
  question,
  index,
  // totalQuestions,
  onUpdate,
  onRemove,
  // onMove,
  renderQuestionTypeFields,
}: {
  question: Question;
  index: number;
  // totalQuestions: number;
  onUpdate: (updates: Partial<Question>) => void;
  onRemove: () => void;
  // onMove: (direction: 'up' | 'down') => void;
  renderQuestionTypeFields: (
    question: Question,
    onUpdate: (updates: Partial<Question>) => void
  ) => JSX.Element | null;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleTypeChange = (type: QuestionType) => {
    const baseQuestion = {
      id: question.id,
      text: question.text,
      type,
      points: question.points,
      gradingType: question.gradingType,
    };

    let newQuestion: Question;
    switch (type) {
      case 'single-choice':
      case 'multiple-choice':
        newQuestion = {
          ...baseQuestion,
          type,
          options: [],
          correctOptions: [],
        };
        break;
      case 'text':
        newQuestion = {
          ...baseQuestion,
          type: 'text',
          textType: 'short',
          caseSensitive: false,
          expectedAnswer: '',
        };
        break;
      case 'fill-in':
        newQuestion = {
          ...baseQuestion,
          type: 'fill-in',
          textWithBlanks: '',
          blankAnswers: {},
        };
        break;
      case 'sort':
        newQuestion = {
          ...baseQuestion,
          type: 'sort',
          items: [],
          correctOrder: [],
        };
        break;
      default:
        return;
    }
    onUpdate(newQuestion);
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/20"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center space-x-2">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <h3 className="font-medium">
              問題 {index + 1} -{' '}
              {question.type === 'single-choice'
                ? '単一選択'
                : question.type === 'multiple-choice'
                ? '複数選択'
                : question.type === 'text'
                ? 'テキスト入力'
                : question.type === 'fill-in'
                ? '穴埋め'
                : '並び替え'}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground max-w-[200px] truncate">
              {question.text || '(問題文未入力)'}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label>問題ID</Label>
              <Input
                value={question.id}
                onChange={(e) => onUpdate({ id: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>問題文</Label>
              <Textarea
                value={question.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>問題タイプ</Label>
              <Select value={question.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-choice">単一選択</SelectItem>
                  <SelectItem value="multiple-choice">複数選択</SelectItem>
                  <SelectItem value="text">テキスト入力</SelectItem>
                  {/* <SelectItem value="fill-in">穴埋め</SelectItem> */}
                  {/* 穴埋めはバグがあるため気が向いたら実装する */}
                  <SelectItem value="sort">並び替え</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>配点</Label>
                <Input
                  type="number"
                  value={question.points}
                  onChange={(e) =>
                    onUpdate({ points: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>採点方式</Label>
                <Select
                  value={question.gradingType}
                  onValueChange={(value: 'auto' | 'manual') =>
                    onUpdate({ gradingType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自動採点</SelectItem>
                    <SelectItem value="manual">手動採点</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 問題タイプ別のフィールド */}
            {renderQuestionTypeFields(question, onUpdate)}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
