import { useState } from 'react';

export const useExamGrading = (questions: any[]) => {
  const [examResult, setExamResult] = useState<any>(null);
  const [correctAnswers, setCorrectAnswers] = useState<any>(null);

  const validateAnswer = (answer: any, question: any): any => {
    if (!answer) return null;

    switch (question.type) {
      case 'single-choice':
      case 'multiple-choice':
        if (!Array.isArray(answer.selectedOptions)) {
          return { ...answer, selectedOptions: [] };
        }
        break;

      case 'text':
        if (typeof answer.text !== 'string') {
          return { ...answer, text: '' };
        }
        break;

      case 'fill-in':
        if (!answer.answers || typeof answer.answers !== 'object') {
          return { ...answer, answers: {} };
        }
        break;

      case 'sort':
        if (!Array.isArray(answer.order)) {
          return {
            ...answer,
            order: [...Array(question.items.length).keys()].map(String),
          };
        }
        break;
    }
    return answer;
  };

  const gradeExam = async (examId: string, answers: any) => {
    try {
      // 正解データを取得
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/exams/${examId}/answers.json`
      );
      if (!response.ok) throw new Error('Failed to load answers');
      const answersData = await response.json();
      setCorrectAnswers(answersData);

      let totalPoints = 0;
      let earnedPoints = 0;
      const questionResults = {};

      for (const question of questions) {
        const answer = validateAnswer(answers[question.id], question);
        const correct = answersData.answers[question.id];

        if (!answer) {
          totalPoints += question.points;
          questionResults[question.id] = {
            isCorrect: false,
            earnedPoints: 0,
            possiblePoints: question.points,
            needsManualGrading: question.gradingType === 'manual',
            notAnswered: true,
          };
          continue;
        }

        if (!correct) continue;

        totalPoints += question.points;
        let isCorrect = false;
        let partialPoints = 0;

        switch (question.type) {
          case 'single-choice':
            isCorrect = answer.selectedOptions[0] === correct.correctOptions[0];
            partialPoints = isCorrect ? question.points : 0;
            break;

          case 'multiple-choice': {
            const selectedSet = new Set(answer.selectedOptions);
            const correctSet = new Set(correct.correctOptions);
            isCorrect =
              selectedSet.size === correctSet.size &&
              [...selectedSet].every((opt) => correctSet.has(opt));
            partialPoints = isCorrect ? question.points : 0;
            break;
          }

          case 'text':
            if (question.gradingType === 'auto') {
              const answerText = answer.text.trim();
              const correctText = correct.correctAnswer.trim();
              isCorrect = correct.caseSensitive
                ? answerText === correctText
                : answerText.toLowerCase() === correctText.toLowerCase();
              partialPoints = isCorrect ? question.points : 0;
            } else {
              partialPoints = 0;
            }
            break;

          case 'fill-in': {
            if (Object.keys(correct.answers).length === 0) {
              partialPoints = 0;
              break;
            }
            let correctBlanks = 0;
            const totalBlanks = Object.keys(correct.answers).length;
            Object.entries(correct.answers).forEach(
              ([key, value]: [string, any]) => {
                const userAnswer = answer.answers[key]?.trim() || '';
                const correctAnswer = value.answer.trim();
                if (value.caseSensitive) {
                  if (userAnswer === correctAnswer) correctBlanks++;
                } else {
                  if (userAnswer.toLowerCase() === correctAnswer.toLowerCase())
                    correctBlanks++;
                }
              }
            );
            partialPoints = (correctBlanks / totalBlanks) * question.points;
            isCorrect = correctBlanks === totalBlanks;
            break;
          }

          case 'sort':
            isCorrect =
              JSON.stringify(answer.order) ===
              JSON.stringify(correct.correctOrder);
            partialPoints = isCorrect ? question.points : 0;
            break;
        }

        earnedPoints += partialPoints;
        questionResults[question.id] = {
          isCorrect,
          earnedPoints: partialPoints,
          possiblePoints: question.points,
          needsManualGrading: question.gradingType === 'manual',
          notAnswered: false,
        };
      }

      const result = {
        totalPoints,
        earnedPoints,
        percentage: totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0,
        questionResults,
        answeredCount: Object.values(answers).filter((a) => a !== null).length,
        totalQuestions: questions.length,
      };

      setExamResult(result);
      return result;
    } catch (error) {
      console.error('Error in gradeExam:', error);
      throw error;
    }
  };

  return {
    examResult,
    correctAnswers,
    gradeExam,
  };
};
