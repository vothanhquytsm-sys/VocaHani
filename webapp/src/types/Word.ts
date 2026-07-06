export interface SRSData {
  easinessFactor: number;
  repetitions: number;
  intervalDays: number;
  nextReviewDate: string; // ISO String format
}

export interface Word {
  id: string;
  word: string;
  ipa: string;
  vietnameseMeaning: string;
  exampleEnglish: string;
  exampleVietnamese: string;
  topic: string;
  level: string;
  symbolName: string;
  isCustom: boolean;
  isLearned: boolean;
  isFavorite: boolean;
  srs?: SRSData;
}
