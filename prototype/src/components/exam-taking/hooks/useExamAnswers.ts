import { useState } from 'react';

interface Question {
  id: string;
  // 他の必要なプロパティ
}

interface Answer {
  type: 'single-choice' | 'multiple-choice' | 'text' | 'fill-in' | 'sort';
  selectedOptions?: string[];
  text?: string;
  answers?: { [key: string]: string };
  order?: string[];
  timestamp?: number;
}

export const useExamAnswers = (questions: Question[]) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: Answer }>({});

  const saveAnswer = (questionId: string, answer: Answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...answer,
        timestamp: Date.now(),
      },
    }));
  };

  const isAnswered = (answer: Answer | undefined): boolean => {
    if (!answer) return false;

    switch (answer.type) {
      case 'single-choice':
      case 'multiple-choice':
        return (
          Array.isArray(answer.selectedOptions) &&
          answer.selectedOptions.length > 0
        );
      case 'text':
        return answer.text !== undefined && answer.text.trim() !== '';
      case 'fill-in':
        return (
          answer.answers !== undefined &&
          Object.values(answer.answers).some(
            (a) => a && typeof a === 'string' && a.trim() !== ''
          )
        );
      case 'sort':
        return Array.isArray(answer.order) && answer.order.length > 0;
      default:
        return false;
    }
  };

  const getUnansweredCount = (): number => {
    return questions.reduce((count, question) => {
      const answer = answers[question.id];
      return count + (isAnswered(answer) ? 0 : 1);
    }, 0);
  };

  const getAnsweredCount = (): number => {
    return questions.length - getUnansweredCount();
  };

  return {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    saveAnswer,
    isAnswered,
    getUnansweredCount,
    getAnsweredCount,
  };
};
