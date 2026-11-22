// Shapes of the files written by scripts/export_books.py (public/data/...).

export type Passage = {
  type: "passage";
  id: string; // "<work>.<section>.<k>"
  n: string; // verse number as printed, or ""
  note?: string[]; // html
  tamil: string[]; // one string per printed line
  translit?: string[];
  translation?: string[]; // html paragraphs
  commentary?: string[]; // html paragraphs
};

export type Block =
  | Passage
  | { type: "para"; html: string }
  | { type: "heading"; html: string }
  | { type: "table"; rows: string[][] };

export type Section = {
  id: string;
  number: string;
  title: string;
  translit: string;
  tamil: string;
  blocks: Block[];
};

export type Work = { id: string; title: string; translit: string; tamil: string; sections: Section[] };

export type Book = {
  id: string;
  collection: string;
  title: string;
  short: string;
  tamilTitle: string;
  romanTitle: string;
  page: string;
  edition: string;
  exported: string;
  intro: { title: string; paras: string[] }[];
  works: Work[];
  glossary: { term: string; tamil: string; def: string }[];
};

export type TocSection = { id: string; number: string; title: string; translit: string; tamil: string; count: number };
export type CatalogBook = Omit<Book, "intro" | "works" | "glossary" | "exported"> & {
  passages: number;
  hasIntro: boolean;
  glossary: number;
  toc: { id: string; title: string; translit: string; tamil: string; sections: TocSection[] }[];
};

export type DailyVerse = {
  book: string;
  id: string;
  ref: string;
  tamil: string[];
  translit: string[];
  translation: string;
};

// [bookId, passageId, reference, translation text, tamil text]
export type SearchRow = [string, string, string, string, string];
