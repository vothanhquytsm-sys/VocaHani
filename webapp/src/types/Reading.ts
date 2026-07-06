export interface ReadingQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOption: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  level: string;
  content: string;
  vocabulary: string[];
  questions: ReadingQuestion[];
}
