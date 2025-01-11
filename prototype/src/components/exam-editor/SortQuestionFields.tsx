import { SortQuestion } from "@/types/question";
import { Label } from '../ui/label';
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/input";

export const SortQuestionFields = ({
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
