import { TextQuestion } from "@/types/question";
import { Label } from "@radix-ui/react-label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { Switch } from "@radix-ui/react-switch";
import { Textarea } from "../ui/textarea";

export const TextQuestionFields = ({
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
