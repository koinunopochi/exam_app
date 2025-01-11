import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ExamConfirmationProps {
  examId: string;
  username: string;
  questionCount: number;
  timeLimit?: number;
  onBack: () => void;
  onStart: () => void;
}

export const ExamConfirmation: React.FC<ExamConfirmationProps> = ({
  examId,
  username,
  questionCount,
  timeLimit,
  onBack,
  onStart,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>試験開始の確認</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            試験を開始すると途中で中断することはできません。
            準備ができましたら開始ボタンを押してください。
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <p>
            <strong>試験ID:</strong> {examId}
          </p>
          <p>
            <strong>ユーザー名:</strong> {username}
          </p>
          <p>
            <strong>問題数:</strong> {questionCount}問
          </p>
          {timeLimit && (
            <p>
              <strong>試験時間:</strong> {timeLimit}分
            </p>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onBack}>
            戻る
          </Button>
          <Button onClick={onStart}>開始する</Button>
        </div>
      </CardContent>
    </Card>
  );
};
