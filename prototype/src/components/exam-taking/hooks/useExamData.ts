import { useState } from 'react';

// 型定義
interface ExamQuestion {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'text' | 'fill-in' | 'sort';
  points: number;
  // 他の必要なプロパティは実際のデータ構造に応じて追加
}

interface UseExamDataReturn {
  questions: ExamQuestion[];
  timeLimit: number | undefined;
  errorMessage: string | null;
  loadExamData: () => Promise<boolean>;
}

export const useExamData = (examId: string): UseExamDataReturn => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadExamData = async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/exams/${examId}/questions.json`
      );

      if (!response.ok) {
        setErrorMessage(
          '試験データの取得に失敗しました。\n試験IDが正しいか確認してください。'
        );
        return false;
      }

      const data = await response.json();
      setQuestions(data.questions);
      setTimeLimit(data.time_limit);
      setErrorMessage(null);
      return true;
    } catch (error) {
      console.error('Error loading exam:', error);
      setErrorMessage(
        '試験データの取得中にエラーが発生しました。\n試験IDが正しいか確認してください。'
      );
      return false;
    }
  };

  return {
    questions,
    timeLimit,
    errorMessage,
    loadExamData,
  };
};
