import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { ScrollArea } from 'src/components/ui/scroll-area';
import type { Question, QuestionAnswer } from 'src/types/question';

type ExamAnswerDetailsProps = {
  questions: Question[];
  answers: Record<string, QuestionAnswer>;
  questionResults: Record<string, {
    isCorrect: boolean;
    earnedPoints: number;
    possiblePoints: number;
  }>;
};

const formatChoiceAnswer = (
  answer: Extract<QuestionAnswer, { type: 'single-choice' | 'multiple-choice' }>,
  question: Extract<Question, { type: 'single-choice' | 'multiple-choice' }>
): string => {
  return answer.selectedOptions
    .map((optId: string) => {
      const option = question.options.find((opt) => opt.id === optId);
      return option ? option.text : `不明な選択肢 (ID: ${optId})`;
    })
    .join(', ');
};

const formatTextAnswer = (
  answer: Extract<QuestionAnswer, { type: 'text' }>
): string => {
  return answer.text || '回答なし';
};

const formatFillInAnswer = (
  answer: Extract<QuestionAnswer, { type: 'fill-in' }>
): string => {
  return Object.entries(answer.answers)
    .map(([key, value]) => `空欄${key}: ${value || '未入力'}`)
    .join(', ');
};

const formatSortAnswer = (
  answer: Extract<QuestionAnswer, { type: 'sort' }>,
  question: Extract<Question, { type: 'sort' }>
): string => {
  return answer.order
    .map((itemId: string) => {
      const item = question.items[parseInt(itemId)];
      return item || `不明な項目 (ID: ${itemId})`;
    })
    .join(' → ');
};

const formatAnswer = (answer: QuestionAnswer, question: Question): string => {
  if (question.type !== answer.type) {
    return '回答形式が一致しません';
  }

  try {
    switch (question.type) {
      case 'single-choice':
      case 'multiple-choice':
        return formatChoiceAnswer(
          answer as Extract<QuestionAnswer, { type: 'single-choice' | 'multiple-choice' }>,
          question as Extract<Question, { type: 'single-choice' | 'multiple-choice' }>
        );
      case 'text':
        return formatTextAnswer(
          answer as Extract<QuestionAnswer, { type: 'text' }>
        );
      case 'fill-in':
        return formatFillInAnswer(
          answer as Extract<QuestionAnswer, { type: 'fill-in' }>
        );
      case 'sort':
        return formatSortAnswer(
          answer as Extract<QuestionAnswer, { type: 'sort' }>,
          question as Extract<Question, { type: 'sort' }>
        );
      default:
        return '不明な回答形式';
    }
  } catch (error) {
    console.error('回答のフォーマット中にエラーが発生しました:', error);
    return '回答の表示に失敗しました';
  }
};

const ExamAnswerDetails = ({ questions, answers, questionResults }: ExamAnswerDetailsProps) => {
  return (
    <ScrollArea className="h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>問題</TableHead>
            <TableHead>回答</TableHead>
            <TableHead>正誤</TableHead>
            <TableHead>得点</TableHead>
            <TableHead>採点方式</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question, index) => {
            const answer = answers[question.id];
            const result = questionResults[question.id];
            if (!answer || !result) return null;

            return (
              <TableRow key={question.id}>
                <TableCell>
                  <div className="font-medium">問題 {index + 1}</div>
                  <div className="text-sm text-muted-foreground">
                    {question.text}
                  </div>
                </TableCell>
                <TableCell>
                  {formatAnswer(answer, question)}
                </TableCell>
                <TableCell>
                  {result.isCorrect ? (
                    <span className="text-green-600">○</span>
                  ) : (
                    <span className="text-red-600">×</span>
                  )}
                </TableCell>
                <TableCell>
                  {result.earnedPoints} / {result.possiblePoints}
                </TableCell>
                <TableCell>
                  {question.gradingType === 'auto' ? '自動' : '手動'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default ExamAnswerDetails;
