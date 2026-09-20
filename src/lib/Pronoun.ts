import type { Word } from "~/type";
import { GrammarPerson, WordRole } from "~/type";

export class Pronoun {
  public info: PronounInfo;

  constructor(key: string) {
    this.info = pronounList[key];
  }

  isSingular(): boolean {
    return this.info.grammarNumber == GrammarNumber.singular;
  }

  isPlural(): boolean {
    return this.info.grammarNumber == GrammarNumber.plural;
  }

  isThirdSingular(): boolean {
    return this.info.grammarPerson === GrammarPerson.third && this.isSingular();
  }

  renderToWord(): Word {
    return {
      text: this.info.spelling.subject,
      role: WordRole.subject,
      form: "pronoun",
    };
  }
}

export enum GrammarCase {
  subject = "subject",
  object = "object",
  possessive_adjective = "possessive_adjective",
  possessive_pronoun = "possessive_pronoun",
  reflexive = "reflexive",
}

export interface PronounInfo {
  grammarPerson: GrammarPerson;
  grammarNumber: GrammarNumber;
  gender?: GrammarGender; // genders are applicable only to the third person's pronouns
  spelling: { [key in GrammarCase]: string };
}

export enum GrammarNumber {
  singular = "singular",
  plural = "plural",
}

export enum GrammarGender {
  masculine = "masculine",
  feminine = "feminine",
  neuter = "neuter",
  epicene = "epicene",
}

export interface PronounList {
  [key: string]: PronounInfo;
}

export const pronounList: PronounList = {
  I: {
    grammarPerson: GrammarPerson.first,
    grammarNumber: GrammarNumber.singular,
    gender: GrammarGender.neuter,
    spelling: {
      // lowercase like every other word, so the contraction rules match it;
      // capitalizePronounI restores it at the end of buildSentence
      subject: "i",
      object: "me",
      possessive_adjective: "my",
      possessive_pronoun: "mine",
      reflexive: "myself",
    },
  },

  we: {
    grammarPerson: GrammarPerson.first,
    grammarNumber: GrammarNumber.plural,
    spelling: {
      subject: "we",
      object: "us",
      possessive_adjective: "our",
      possessive_pronoun: "ours",
      reflexive: "ourselves",
    },
  },

  // don't need this yet
  /*
  you_singular: {
    grammarPerson: GrammarPerson.second,
    grammarNumber: GrammarNumber.singular,
    spelling: {
      subject: 'you',
      object: 'you',
      possessive_adjective: 'your',
      possessive_pronoun: 'yours',
      reflexive: 'yourself' // this case is the only diff between singular and plural "you"
    }
  },
  */

  you: {
    grammarPerson: GrammarPerson.second,
    grammarNumber: GrammarNumber.plural,
    spelling: {
      subject: "you",
      object: "you",
      possessive_adjective: "your",
      possessive_pronoun: "yours",
      reflexive: "yourselves", // this case is the only diff between you singular and you plural
    },
  },

  he: {
    grammarPerson: GrammarPerson.third,
    grammarNumber: GrammarNumber.singular,
    gender: GrammarGender.masculine,
    spelling: {
      subject: "he",
      object: "him",
      possessive_adjective: "his",
      possessive_pronoun: "his",
      reflexive: "himself",
    },
  },

  she: {
    grammarPerson: GrammarPerson.third,
    grammarNumber: GrammarNumber.singular,
    gender: GrammarGender.feminine,
    spelling: {
      subject: "she",
      object: "her",
      possessive_adjective: "her",
      possessive_pronoun: "hers",
      reflexive: "herself",
    },
  },

  it: {
    grammarPerson: GrammarPerson.third,
    grammarNumber: GrammarNumber.singular,
    gender: GrammarGender.neuter,
    spelling: {
      subject: "it",
      object: "it",
      possessive_adjective: "its",
      possessive_pronoun: "", // never used
      reflexive: "itself",
    },
  },

  they: {
    grammarPerson: GrammarPerson.third,
    grammarNumber: GrammarNumber.plural,
    gender: GrammarGender.epicene,
    spelling: {
      subject: "they",
      object: "them",
      possessive_adjective: "their",
      possessive_pronoun: "theirs",
      reflexive: "themselves",
    },
  },
};
