import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface ExamTimerProps {
  timeLimit?: number; // 分単位、未設定の場合はundefined
  onTimeUp?: () => void;
  examStartTime: number;
}

const ExamTimer: React.FC<ExamTimerProps> = ({
  timeLimit,
  onTimeUp,
  examStartTime,
}) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(
    timeLimit ? timeLimit * 60 : null
  );

  useEffect(() => {
    if (!timeLimit) return;

    const updateTimer = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - examStartTime) / 1000);
      const remaining = timeLimit * 60 - elapsedSeconds;

      if (remaining <= 0) {
        setRemainingTime(0);
        onTimeUp?.();
      } else {
        setRemainingTime(remaining);
      }
    };

    // 初回実行
    updateTimer();

    // 1秒ごとに更新
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timeLimit, examStartTime, onTimeUp]);

  if (!timeLimit) {
    return (
      <Card className="p-4 bg-secondary">
        <div className="text-center">
          <span className="font-semibold">制限時間: 無制限</span>
        </div>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}時間`);
    if (minutes > 0 || hours > 0) parts.push(`${minutes}分`);
    parts.push(`${remainingSeconds}秒`);

    return parts.join(' ');
  };

  return (
    <Card
      className={`p-4 ${
        remainingTime && remainingTime < 300 ? 'bg-red-100' : 'bg-secondary'
      }`}
    >
      <div className="text-center">
        <span className="font-semibold">
          残り時間:{' '}
          {remainingTime !== null ? formatTime(remainingTime) : '計算中...'}
        </span>
      </div>
    </Card>
  );
};

export default ExamTimer;
