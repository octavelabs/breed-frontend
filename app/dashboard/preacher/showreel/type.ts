export type CourseCategory = {
  id: string;
  title: string;

};

export type CourseFormData = {
 title:string;
 banner: File | null;
 courseDescription: string;
 chapterDescription: string;
 chapterName: string;
 categories: string[]
}

export type CourseDetails = {
  id: string;
  title: string;
  date: string;
  chapters: number;
  status: string;
  lessons: number;
  participants: number;
  comments: number;
  imageUrl?: string;
}