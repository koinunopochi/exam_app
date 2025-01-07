import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, FileJson, Upload } from 'lucide-react';
import { Alert } from '../ui/alert';
import {
  ChoiceQuestion,
  FillInQuestion,
  Question,
  QuestionType,
  SortQuestion,
  TextQuestion,
} from '../../types/question';
import { downloadZIP, generateUniqueId } from '../exam-editor/utils';
import { QuestionCard } from '../exam-editor/QuestionCard';
import { ChoiceQuestionFields } from '../exam-editor/ChoiceQuestionFields';
import { TextQuestionFields } from '../exam-editor/TextQuestionFields';
import { FillInQuestionFields } from '../exam-editor/FillInQuestionFields';
import { SortQuestionFields } from '../exam-editor/SortQuestionFields';

const ExamEditorPage = () => {
  const [examId, setExamId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [timeLimit, setTimeLimit] = useState<number>(60);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(e.target?.result as ArrayBuffer);
        
        // 必要なファイルを探す
        const questionFile = Object.keys(zip.files).find(name => name.endsWith('_questions.json'));
        const answerFile = Object.keys(zip.files).find(name => name.endsWith('_answers.json'));
        const metadataFile = Object.keys(zip.files).find(name => name.endsWith('_metadata.json'));

        if (!questionFile || !answerFile || !metadataFile) {
          throw new Error('必要なファイルがZIP内に見つかりません');
        }

        // 各ファイルを読み込む
        const [questionData, answerData, metadata] = await Promise.all([
          zip.file(questionFile)?.async('string'),
          zip.file(answerFile)?.async('string'),
          zip.file(metadataFile)?.async('string')
        ]);

        if (!questionData || !answerData || !metadata) {
          throw new Error('ファイルの読み込みに失敗しました');
        }

        // データをパース
        const questions = JSON.parse(questionData);
        const answers = JSON.parse(answerData);
        const meta = JSON.parse(metadata);

        // 状態を更新
        if (meta.exam_id) {
          setExamId(meta.exam_id);
        }
        if (meta.title) {
          setTitle(meta.title);
        }
        if (meta.description) {
          setDescription(meta.description);
        }
        if (meta.author) {
          setAuthor(meta.author);
        }
        if (questions.time_limit) {
          setTimeLimit(questions.time_limit);
        }

        // 質問と回答を結合
        const combinedQuestions = questions.questions.map((q: any) => {
          const answer = answers.answers[q.id];
          if (!answer) return q;

          switch (q.type) {
            case 'single-choice':
            case 'multiple-choice':
              return { ...q, correctOptions: answer.correctOptions };
            case 'text':
              return {
                ...q,
                expectedAnswer: answer.correctAnswer,
                caseSensitive: answer.caseSensitive
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
        alert('ZIPファイルの読み込みに失敗しました: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
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

    const questionData = {
      exam_id: examId,
      time_limit: timeLimit,
      questions: questions.map(({
        id,
        type,
        text,
        points,
        gradingType,
        ...questionData
      }) => ({
        id,
        type,
        text,
        points,
        gradingType,
        ...questionData
      }))
    };

    const answerData = {
      exam_id: examId,
      answers: questions.reduce((acc, question) => {
        const { id, type } = question;
        let answer;
        
        switch (type) {
          case 'single-choice':
          case 'multiple-choice':
            answer = { correctOptions: (question as ChoiceQuestion).correctOptions };
            break;
          case 'text':
            answer = {
              correctAnswer: (question as TextQuestion).expectedAnswer,
              caseSensitive: (question as TextQuestion).caseSensitive
            };
            break;
          case 'fill-in':
            answer = { answers: (question as FillInQuestion).blankAnswers };
            break;
          case 'sort':
            answer = { correctOrder: (question as SortQuestion).correctOrder };
            break;
        }
        
        return { ...acc, [id]: answer };
      }, {})
    };

    const metadata = {
      exam_id: examId,
      title: title.trim() || 'Untitled Exam',
      description: description.trim() || 'No description',
      author: author.trim() || 'Anonymous',
      create_date: new Date().toISOString().split('T')[0]
    };

    downloadZIP([
      {
        name: `${examId}_questions.json`,
        data: questionData
      },
      {
        name: `${examId}_answers.json`,
        data: answerData
      },
      {
        name: `${examId}_metadata.json`,
        data: metadata
      }
    ]);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="mb-5">試験問題・解答作成</CardTitle>
          <Alert>
            ※ 試験を追加したい場合は、
            <a
              href="https://github.com/koinunopochi/exam_app/issues/new?template=exam_submission.md"
              className="text-blue-600"
              aria-label="GitHub Issue"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Issue
            </a>
            を作成してください。ZIPファイル等の添付はセキュリティリスクのため禁止されています。
          </Alert>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="試験のタイトル"
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="description">説明</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="試験の説明"
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="author">作成者</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="作成者名"
                />
              </div>

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
            </div>

            <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                ZIPインポート
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
                      renderQuestionTypeFields={renderQuestionTypeFields}
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

export default ExamEditorPage;
