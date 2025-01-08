import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ExamState = 'init' | 'confirm' | 'exam' | 'complete';

export const useExamState = () => {
  const [searchParams] = useSearchParams();
  const [examState, setExamState] = useState<ExamState>('init');
  const [examId, setExamId] = useState(searchParams.get('exam_id') || '');
  const [username, setUsername] = useState('');
  const [examStartTime, setExamStartTime] = useState<number>(0);

  const handleStartConfirm = async (loadExamData: () => Promise<boolean>) => {
    if (!examId.trim() || !username.trim()) {
      alert('試験IDとユーザー名を入力してください');
      return;
    }
    const success = await loadExamData();
    if (success) {
      setExamState('confirm');
    }
  };

  const startExam = () => {
    setExamStartTime(Date.now());
    setExamState('exam');
  };

  return {
    examState,
    setExamState,
    examId,
    setExamId,
    username,
    setUsername,
    examStartTime,
    handleStartConfirm,
    startExam,
  };
};
