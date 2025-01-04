// 基本的な型定義
export type QuestionType =
  | 'single-choice'
  | 'multiple-choice'
  | 'text'
  | 'fill-in'
  | 'sort';

// 基本のオプションとコンポーネント
export interface QuestionOption {
  id: string;
  text: string;
}

// 基本の問題型
export interface BaseQuestion {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  gradingType: 'auto' | 'manual';
}

// 選択式問題型
export interface ChoiceQuestion extends BaseQuestion {
  type: 'single-choice' | 'multiple-choice';
  options: QuestionOption[];
  correctOptions: string[];
}

// テキスト問題型
export interface TextQuestion extends BaseQuestion {
  type: 'text';
  textType: 'short' | 'long';
  caseSensitive: boolean;
  expectedAnswer: string;
}

// 穴埋め問題型
export interface FillInQuestion extends BaseQuestion {
  type: 'fill-in';
  textWithBlanks: string;
  blankAnswers: {
    [key: string]: {
      answer: string;
      caseSensitive: boolean;
    };
  };
}

// 並べ替え問題型
export interface SortQuestion extends BaseQuestion {
  type: 'sort';
  items: string[];
  correctOrder: string[];
}

// 統合した問題型
export type Question =
  | ChoiceQuestion
  | TextQuestion
  | FillInQuestion
  | SortQuestion;

// 回答の型定義
export interface ChoiceAnswer {
  type: 'single-choice' | 'multiple-choice';
  selectedOptions: string[];
}

export interface TextAnswer {
  type: 'text';
  text: string;
}

export interface FillInAnswer {
  type: 'fill-in';
  answers: Record<string, string>;
}

export interface SortAnswer {
  type: 'sort';
  order: string[];
}

export type QuestionAnswer =
  | ChoiceAnswer
  | TextAnswer
  | FillInAnswer
  | SortAnswer;

// 採点用のヘルパー型
export interface GradingResult {
  correct: boolean;
  score: number;
  feedback?: string;
}

// 問題と回答のペアを表す型
export interface QuestionResponsePair {
  question: Question;
  answer: QuestionAnswer;
  gradingResult?: GradingResult;
}

// 型ガード関数
export const isChoiceQuestion = (
  question: Question
): question is ChoiceQuestion => {
  return (
    question.type === 'single-choice' || question.type === 'multiple-choice'
  );
};

export const isTextQuestion = (
  question: Question
): question is TextQuestion => {
  return question.type === 'text';
};

export const isFillInQuestion = (
  question: Question
): question is FillInQuestion => {
  return question.type === 'fill-in';
};

export const isSortQuestion = (
  question: Question
): question is SortQuestion => {
  return question.type === 'sort';
};

// 回答の型ガード
export const isChoiceAnswer = (
  answer: QuestionAnswer
): answer is ChoiceAnswer => {
  return answer.type === 'single-choice' || answer.type === 'multiple-choice';
};

export const isTextAnswer = (answer: QuestionAnswer): answer is TextAnswer => {
  return answer.type === 'text';
};

export const isFillInAnswer = (
  answer: QuestionAnswer
): answer is FillInAnswer => {
  return answer.type === 'fill-in';
};

export const isSortAnswer = (answer: QuestionAnswer): answer is SortAnswer => {
  return answer.type === 'sort';
};
