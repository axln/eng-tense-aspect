export enum WordRole {
  verb = "verb",
  passive = "passive",
  aux = "aux",
  negation = "negation",
  modal = "modal",
  subject = "subject",
  end = "end",
}

export type Word = {
  text: string; // word spelling
  role: WordRole; // role in the sentence: modal, aux, negation, verb, passive,
  form?: string; // grammatical form
};

export enum GrammarPerson {
  first = "first",
  second = "second",
  third = "third",
}

/*
export type VerbObjects = {
  active: string[];
  passive?: string[];
};

export type Objects = {
  [key: string]: VerbObjects;
};
*/
