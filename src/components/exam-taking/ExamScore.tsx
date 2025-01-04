import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface ExamScoreProps {
  earnedPoints: number;
  totalPoints: number;
  percentage: number;
}

const ExamScore: React.FC<ExamScoreProps> = ({
  earnedPoints,
  totalPoints,
  percentage,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <Card className="p-8 bg-background">
      <div className="text-center space-y-8">
        <h3 className="text-2xl font-bold">採点結果</h3>
        <div className="relative w-48 h-48 mx-auto">
          {/* プログレスリング */}
          <Progress
            value={progress}
            className="h-48 w-48 absolute transform -rotate-90"
          />
          {/* 中央の白い円 */}
          <div className="absolute inset-4 rounded-full bg-background" />
          {/* テキスト */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">
              {percentage.toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              {earnedPoints} / {totalPoints} 点
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">獲得点数</p>
            <p className="text-2xl font-semibold">{earnedPoints}</p>
          </div>
          <div className="text-center px-2">
            <p className="text-sm text-muted-foreground mb-1 invisible">
              spacer
            </p>
            <p className="text-2xl font-semibold">/</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">満点</p>
            <p className="text-2xl font-semibold">{totalPoints}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExamScore;
