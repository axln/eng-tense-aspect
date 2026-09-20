export enum WordRole {
  verb = "verb",
  passive = "passive",
  aux = "aux",
  negation = "negation",
  modal = "modal",
  subject = "subject",
  object = "object",
  end = "end",
}

// One piece of a contracted word: the "I" and the "'m" of "I'm", the "has" and
// the "n't" of "hasn't". Each keeps the role it had before the words merged.
export type WordPart = {
  text: string;
  role: WordRole;
};

export type Word = {
  text: string; // word spelling
  role: WordRole; // role in the sentence: modal, aux, negation, verb, passive,
  form?: string; // grammatical form
  // Only on a contracted word, which is several words written as one. There
  // are always at least two parts, their texts joined make `text`, and `role`
  // is the role of the first. Nothing else has parts.
  parts?: WordPart[];
};

export enum GrammarPerson {
  first = "first",
  second = "second",
  third = "third",
}

export type VerbObjects = {
  active: string[];
  passive?: string[];
  // transitive verbs sound unfinished without an object ("I bring."), so the
  // UI offers no "no object" choice for them. Only the active voice is
  // affected: in the passive the object has become the subject, which leaves
  // "It is brought." complete on its own.
  required?: boolean;
};

export type Objects = {
  [key: string]: VerbObjects;
};
