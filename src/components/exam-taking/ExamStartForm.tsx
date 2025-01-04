import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ExamStartFormProps {
  examId: string;
  username: string;
  onExamIdChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const ExamStartForm: React.FC<ExamStartFormProps> = ({
  examId,
  username,
  onExamIdChange,
  onUsernameChange,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>試験開始</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="examId">試験ID</Label>
          <Input
            id="examId"
            value={examId}
            onChange={(e) => onExamIdChange(e.target.value)}
            placeholder="試験IDを入力してください"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">ユーザー名</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="ユーザー名を入力してください"
            disabled={isSubmitting}
          />
        </div>
        <Button className="w-full" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? '処理中...' : '開始'}
        </Button>
      </CardContent>
    </Card>
  );
};
