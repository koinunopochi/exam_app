import { useState } from 'react';
import { createSecureZip } from '@/utils/crypto';

interface ExamFinishProps {
  examId: string;
  username: string;
  answers: { [key: string]: any };
  gradeExam: (examId: string, answers: { [key: string]: any }) => Promise<any>;
  questionsCount: number;
  getUnansweredCount: () => number;
  getAnsweredCount: () => number;
  onComplete: () => void;
}

export const useExamFinish = ({
  examId,
  username,
  answers,
  gradeExam,
  questionsCount,
  getUnansweredCount,
  getAnsweredCount,
  onComplete,
}: ExamFinishProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const showFinishConfirmation = () => {
    const unansweredCount = getUnansweredCount();
    if (unansweredCount > 0) {
      if (
        !confirm(
          `未回答の問題が${unansweredCount}問あります。\n` +
            `全${questionsCount}問中${getAnsweredCount()}問が回答済みです。\n` +
            `終了してもよろしいですか？`
        )
      ) {
        return;
      }
    }
    setShowConfirmDialog(true);
  };

  const finishExam = async () => {
    const examData = {
      examId,
      username,
      timestamp: Date.now(),
      answers,
      metadata: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
    };

    try {
      const result = await gradeExam(examId, answers);
      const finalData = {
        ...examData,
        result,
      };

      const zipBlob = await createSecureZip(finalData);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam_result_${examId}_${username}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onComplete();
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error processing exam data:', error);
      alert('結果の処理中にエラーが発生しました');
    }
  };

  return {
    showConfirmDialog,
    setShowConfirmDialog,
    showFinishConfirmation,
    finishExam,
  };
};
