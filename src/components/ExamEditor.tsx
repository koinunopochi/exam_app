import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Plus,
  Trash2,
  FileJson,
  ChevronDown,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { Alert } from './ui/alert';
import {
  ChoiceQuestion,
  FillInQuestion,
  Question,
  QuestionType,
  SortQuestion,
  TextQuestion,
} from '@/types/question';
import { downloadJSON, generateUniqueId } from '@/components/exam-editor/utils';

const ExamEditor = () => {
  const [examId, setExamId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [timeLimit, setTimeLimit] = useState<number>(60);

  // JSONインポート機能
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        if (jsonData.examId) {
          setExamId(jsonData.examId);
        }

        // time_limitの読み込み
        if (jsonData.time_limit) {
          setTimeLimit(jsonData.time_limit);
        }

        if (jsonData.questions) {
          // answersファイルを要求
          if (fileInputRef.current) {
            fileInputRef.current.click();
            fileInputRef.current.onchange = async (event) => {
              const answersFile = (event.target as HTMLInputElement).files?.[0];
              if (!answersFile) return;

              const answersReader = new FileReader();
              answersReader.onload = (e) => {
                try {
                  const answersData = JSON.parse(e.target?.result as string);
                  // 問題と回答を結合
                  const combinedQuestions = jsonData.questions.map((q: any) => {
                    const answer = answersData.answers[q.id];
                    if (!answer) return q;

                    switch (q.type) {
                      case 'single-choice':
                      case 'multiple-choice':
                        return { ...q, correctOptions: answer.correctOptions };
                      case 'text':
                        return {
                          ...q,
                          expectedAnswer: answer.correctAnswer,
                          caseSensitive: answer.caseSensitive,
                        };
                      case 'fill-in':
                        return { ...q, blankAnswers: answer.answers };
                      case 'sort':
                        return { ...q, correctOrder: answer.correctOrder };
                      default:
                        return q;
                    }
                  });
                  setQuestions(combinedQuestions);
                } catch (error: any) {
                  console.error(error);
                  alert('解答ファイルの形式が正しくありません');
                }
              };
              answersReader.readAsText(answersFile);
            };
          }
        }
      } catch (error: any) {
        console.error(error);
        alert('ファイルの形式が正しくありません');
      }
    };
    reader.readAsText(file);
  };

  const createNewQuestion = (type: QuestionType, id: string): Question => {
    const baseQuestion = {
      id,
      text: '',
      points: 1,
      gradingType: 'auto' as const,
    };

    switch (type) {
      case 'single-choice':
      case 'multiple-choice':
        return {
          ...baseQuestion,
          type,
          options: [],
          correctOptions: [],
        } as ChoiceQuestion;
      case 'text':
        return {
          ...baseQuestion,
          type: 'text',
          textType: 'short' as const,
          caseSensitive: false,
          expectedAnswer: '',
        } as TextQuestion;
      case 'fill-in':
        return {
          ...baseQuestion,
          type: 'fill-in',
          textWithBlanks: '',
          blankAnswers: {},
        } as FillInQuestion;
      case 'sort':
        return {
          ...baseQuestion,
          type: 'sort',
          items: [],
          correctOrder: [],
        } as SortQuestion;
    }
  };

  const addQuestion = () => {
    const newQuestion = createNewQuestion(
      'single-choice',
      `q${questions.length + 1}`
    );

    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q, i) => {
        if (i !== index) return q;

        if (updates.type && updates.type !== q.type) {
          return createNewQuestion(updates.type, q.id);
        }

        return { ...q, ...updates } as Question;
      })
    );
  };

  const generateJSON = () => {
    if (!examId.trim()) {
      alert('試験IDを入力してください');
      return;
    }

    if (questions.length === 0) {
      alert('問題を1つ以上追加してください');
      return;
    }

    // questions.jsonのデータ
    const questionsJSON = {
      examId,
      time_limit: timeLimit,
      questions: questions.map(
        ({
          // correctOptions,
          // expectedAnswer,
          // blankAnswers,
          // correctOrder,
          ...questionData
        }) => questionData
      ),
    };

    // answers.jsonのデータ
    const answersJSON = {
      examId,
      answers: questions.reduce((acc, question) => {
        switch (question.type) {
          case 'single-choice':
          case 'multiple-choice':
            acc[question.id] = {
              type: question.type,
              correctOptions: question.correctOptions,
            };
            break;
          case 'text':
            acc[question.id] = {
              type: question.type,
              correctAnswer: question.expectedAnswer,
              caseSensitive: question.caseSensitive,
            };
            break;
          case 'fill-in':
            acc[question.id] = {
              type: question.type,
              answers: question.blankAnswers,
            };
            break;
          case 'sort':
            acc[question.id] = {
              type: question.type,
              correctOrder: question.correctOrder,
            };
            break;
        }
        return acc;
      }, {} as Record<string, any>),
    };

    downloadJSON(questionsJSON, `${examId}_questions.json`);
    downloadJSON(answersJSON, `${examId}_answers.json`);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="mb-5">試験問題・解答作成</CardTitle>
          <Alert>
            ※ 試験を追加したい場合は、
            <a
              href="mailto:koinunopoti@gmail.com"
              className="text-blue-600"
              aria-label="Email"
            >
              管理者アドレス
            </a>
            までファイルを添付していただければ問題がないか確認後掲載いたします。
          </Alert>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="examId">試験ID</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExamId(generateUniqueId('exam_'))}
                >
                  自動生成
                </Button>
              </div>
              <Input
                id="examId"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                placeholder="exam001"
              />
            </div>

            {/* 制限時間の入力フィールドを追加 */}
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="timeLimit">制限時間（分）</Label>
              <Input
                id="timeLimit"
                type="number"
                min="1"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                placeholder="60"
              />
            </div>

            <div className="flex gap-2">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                JSONインポート
              </Button>
              <Button onClick={generateJSON} variant="outline">
                <FileJson className="w-4 h-4 mr-2" />
                JSONエクスポート
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">問題リスト</h3>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  問題を追加
                </Button>
              </div>

              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      onUpdate={(updates) => updateQuestion(index, updates)}
                      onRemove={() => removeQuestion(index)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator className="my-4" />

            <Button onClick={generateJSON} variant="outline">
              <FileJson className="w-4 h-4 mr-2" />
              JSON生成
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuestionCard = ({
  question,
  index,
  // totalQuestions,
  onUpdate,
  onRemove,
}: // onMove,
{
  question: Question;
  index: number;
  // totalQuestions: number;
  onUpdate: (updates: Partial<Question>) => void;
  onRemove: () => void;
  // onMove: (direction: 'up' | 'down') => void;
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

const renderQuestionTypeFields = (
  question: Question,
  onUpdate: (updates: Partial<Question>) => void
) => {
  switch (question.type) {
    case 'single-choice':
    case 'multiple-choice':
      return <ChoiceQuestionFields question={question} onUpdate={onUpdate} />;
    case 'text':
      return (
        <TextQuestionFields
          question={question as TextQuestion}
          onUpdate={onUpdate}
        />
      );
    case 'fill-in':
      return (
        <FillInQuestionFields
          question={question as FillInQuestion}
          onUpdate={onUpdate}
        />
      );
    case 'sort':
      return (
        <SortQuestionFields
          question={question as SortQuestion}
          onUpdate={onUpdate}
        />
      );
    default:
      return null;
  }
};

const ChoiceQuestionFields = ({
  question,
  onUpdate,
}: {
  question: ChoiceQuestion;
  onUpdate: (updates: Partial<ChoiceQuestion>) => void;
}) => {
  const addOption = () => {
    const newOption = {
      id: generateUniqueId('opt_'),
      text: '',
    };
    onUpdate({ options: [...question.options, newOption] });
  };

  const removeOption = (index: number) => {
    const newOptions = question.options.filter((_, i) => i !== index);
    const newCorrectOptions = question.correctOptions.filter((id) =>
      newOptions.some((opt) => opt.id === id)
    );
    onUpdate({
      options: newOptions,
      correctOptions: newCorrectOptions,
    });
  };

  const updateOption = (index: number, text: string) => {
    onUpdate({
      options: question.options.map((opt, i) =>
        i === index ? { ...opt, text } : opt
      ),
    });
  };

  const toggleCorrectOption = (optionId: string) => {
    let newCorrectOptions: string[];
    if (question.type === 'single-choice') {
      newCorrectOptions = [optionId];
    } else {
      newCorrectOptions = question.correctOptions.includes(optionId)
        ? question.correctOptions.filter((id) => id !== optionId)
        : [...question.correctOptions, optionId];
    }
    onUpdate({ correctOptions: newCorrectOptions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>選択肢と正解設定</Label>
        <Button onClick={addOption} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          選択肢を追加
        </Button>
      </div>

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Switch
              checked={question.correctOptions.includes(option.id)}
              onCheckedChange={() => toggleCorrectOption(option.id)}
            />
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`選択肢 ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TextQuestionFields = ({
  question,
  onUpdate,
}: {
  question: TextQuestion;
  onUpdate: (updates: Partial<TextQuestion>) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>テキストタイプ</Label>
        <Select
          value={question.textType}
          onValueChange={(value: 'short' | 'long') =>
            onUpdate({ textType: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">短文</SelectItem>
            <SelectItem value="long">長文</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={question.caseSensitive}
          onCheckedChange={(checked) => onUpdate({ caseSensitive: checked })}
        />
        <Label>大文字小文字を区別する</Label>
      </div>

      <div className="space-y-2">
        <Label>正解</Label>
        <Textarea
          value={question.expectedAnswer}
          onChange={(e) => onUpdate({ expectedAnswer: e.target.value })}
          placeholder="正解となる文章を入力してください"
        />
      </div>
    </div>
  );
};

const FillInQuestionFields = ({
  question,
  onUpdate,
}: {
  question: FillInQuestion;
  onUpdate: (updates: Partial<FillInQuestion>) => void;
}) => {
  const updateBlankAnswer = (
    blankNum: string,
    updates: Partial<{ answer: string; caseSensitive: boolean }>
  ) => {
    onUpdate({
      blankAnswers: {
        ...question.blankAnswers,
        [blankNum]: {
          ...question.blankAnswers[blankNum],
          ...updates,
        },
      },
    });
  };

  const updateTextWithBlanks = (text: string) => {
    onUpdate({ textWithBlanks: text });

    // 空欄の番号を抽出
    const blanks = text.match(/\{(\d+)\}/g) || [];
    const blankNumbers = blanks.map((b) => b.match(/\d+/)?.[0] || '');

    // 既存の回答を保持しつつ、新しい空欄の回答を初期化
    const newBlankAnswers = { ...question.blankAnswers };
    blankNumbers.forEach((num) => {
      if (!newBlankAnswers[num]) {
        newBlankAnswers[num] = {
          answer: '',
          caseSensitive: false,
        };
      }
    });

    // 不要な回答を削除
    Object.keys(newBlankAnswers).forEach((key) => {
      if (!blankNumbers.includes(key)) {
        delete newBlankAnswers[key];
      }
    });

    onUpdate({ blankAnswers: newBlankAnswers });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          穴埋めテキスト (空欄は {'{1}'}, {'{2}'} のように指定)
        </Label>
        <Textarea
          value={question.textWithBlanks}
          onChange={(e) => updateTextWithBlanks(e.target.value)}
          placeholder="例: これは{1}の{2}です。"
        />
      </div>

      <div className="space-y-4">
        {Object.entries(question.blankAnswers).map(([blankNum, answer]) => (
          <div key={blankNum} className="space-y-2 border p-4 rounded">
            <Label>空欄{blankNum}の正解</Label>
            <Input
              value={answer.answer}
              onChange={(e) =>
                updateBlankAnswer(blankNum, { answer: e.target.value })
              }
              placeholder={`空欄${blankNum}の正解を入力`}
            />
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                checked={answer.caseSensitive}
                onCheckedChange={(checked) =>
                  updateBlankAnswer(blankNum, { caseSensitive: checked })
                }
              />
              <Label>大文字小文字を区別する</Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SortQuestionFields = ({
  question,
  onUpdate,
}: {
  question: SortQuestion;
  onUpdate: (updates: Partial<SortQuestion>) => void;
}) => {
  const addItem = () => {
    const newItems = [...question.items, ''];
    onUpdate({
      items: newItems,
      correctOrder: newItems.map((_, index) => index.toString()),
    });
  };

  const removeItem = (index: number) => {
    const newItems = question.items.filter((_, i) => i !== index);
    onUpdate({
      items: newItems,
      correctOrder: newItems.map((_, index) => index.toString()),
    });
  };

  const updateItem = (index: number, text: string) => {
    const newItems = question.items.map((item, i) =>
      i === index ? text : item
    );
    onUpdate({ items: newItems });
  };

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= question.items.length) return;

    const newCorrectOrder = [...question.correctOrder];
    const temp = newCorrectOrder[fromIndex];
    newCorrectOrder[fromIndex] = newCorrectOrder[toIndex];
    newCorrectOrder[toIndex] = temp;

    onUpdate({ correctOrder: newCorrectOrder });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>並び替え項目</Label>
        <Button onClick={addItem} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          項目を追加
        </Button>
      </div>

      <div className="space-y-2">
        {question.items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`項目 ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>正解の順序</Label>
        <div className="space-y-2">
          {question.correctOrder.map((itemIndex, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="flex-1 p-2 border rounded bg-secondary">
                {question.items[parseInt(itemIndex)]}
              </div>
              <div className="flex flex-col space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === question.items.length - 1}
                >
                  ↓
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamEditor;
