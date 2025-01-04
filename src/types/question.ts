// 基本の問題オプション型
export interface QuestionOption {
  id: string;
  text: string;
}

// 選択式（単一・複数）の回答型
export interface ChoiceAnswer {
  type: 'single-choice' | 'multiple-choice';
  selectedOptions: string[];
}

// テキスト回答型
export interface TextAnswer {
  type: 'text';
  text: string;
}

// 穴埋め回答型
export interface FillInAnswer {
  type: 'fill-in';
  answers: Record<string, string>;
}

// 並べ替え回答型
export interface SortAnswer {
  type: 'sort';
  order: string[];
}

// 統合した回答型
export type QuestionAnswer =
  | ChoiceAnswer
  | TextAnswer
  | FillInAnswer
  | SortAnswer;

// 問題の基本型
export interface BaseQuestion {
  id: string;
  type: string;
  text: string;
}

// 選択式問題型
export interface ChoiceQuestion extends BaseQuestion {
  type: 'single-choice' | 'multiple-choice';
  options: QuestionOption[];
}

// テキスト問題型
export interface TextQuestion extends BaseQuestion {
  type: 'text';
  textType: 'short' | 'long';
}

// 穴埋め問題型
export interface FillInQuestion extends BaseQuestion {
  type: 'fill-in';
  textWithBlanks: string;
}

// 並べ替え問題型
export interface SortQuestion extends BaseQuestion {
  type: 'sort';
  items: string[];
}

// 統合した問題型
export type Question =
  | ChoiceQuestion
  | TextQuestion
  | FillInQuestion
  | SortQuestion;
