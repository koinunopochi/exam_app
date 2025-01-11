// ExamNavigation.tsx
import { Button } from '@/components/ui/button';

interface ExamNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onNavigate: (index: number) => void;
}

export const ExamNavigation = ({
  currentIndex,
  totalQuestions,
  onNavigate,
}: ExamNavigationProps) => {
  return (
    <div className="flex justify-between pt-4">
      <Button
        variant="outline"
        disabled={currentIndex === 0}
        onClick={() => onNavigate(currentIndex - 1)}
      >
        前の問題
      </Button>
      <Button
        disabled={currentIndex === totalQuestions - 1}
        onClick={() => onNavigate(currentIndex + 1)}
      >
        次の問題
      </Button>
    </div>
  );
};
