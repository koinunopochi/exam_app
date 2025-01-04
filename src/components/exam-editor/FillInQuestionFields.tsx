import { FillInQuestion } from "@/types/question";
import { Label } from '../ui/label';
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Switch } from '../ui/switch';

export const FillInQuestionFields = ({
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
