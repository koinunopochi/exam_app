import { ChoiceQuestion } from "@/types/question";
import { generateUniqueId } from "./utils";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Switch } from "@radix-ui/react-switch";
import { Input } from "../ui/input";

export const ChoiceQuestionFields = ({
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
