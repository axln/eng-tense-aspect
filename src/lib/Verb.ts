import type { Word } from "~/type";
import { WordRole } from "~/type";
import { verbList } from "~/spelling/VerbList";
import { BaseVerb } from "~/lib/BaseVerb";
import { Pronoun } from "~/lib/Pronoun";
import { contractedNegative } from "~/lib/Helper";

export class Verb extends BaseVerb {
  public form: VerbForm = VerbForm.base;
  public subject?: Pronoun;

  constructor(base: string, public role: WordRole = WordRole.verb) {
    super(base);
  }

  getSpellingInfo(verbBase: string): VerbVariants {
    return verbList[verbBase];
  }

  makePersonal(subject: Pronoun, present: boolean): void {
    this.subject = subject;
    this.form = present ? VerbForm.present : VerbForm.past;
  }

  // A present or past form agrees with the subject, and makePersonal sets the
  // two together. `form` is public, though, so a caller can set it alone; say
  // so plainly rather than crash on "undefined".
  protected requireSubject(): Pronoun {
    if (!this.subject) {
      throw new Error("Subject must be set for present and past verb forms.");
    }

    return this.subject;
  }

  getVerbForm(): string {
    const verbInfo = this.getSpellingInfo(this.base);

    switch (this.form) {
      case VerbForm.base:
        return this.base;

      case VerbForm.ing:
        return verbInfo.ing || `${this.base}ing`;

      case VerbForm.past:
        return verbInfo.past || verbInfo.ed || `${this.base}ed`;

      case VerbForm.v3:
        return verbInfo.v3 || verbInfo.ed || `${this.base}ed`;

      case VerbForm.present:
        if (this.requireSubject().isThirdSingular()) {
          return verbInfo.thirdSingular || `${this.base}s`;
        } else {
          return this.base;
        }
    }
  }

  renderToWords(): Word[] {
    if (this.form === VerbForm.present || this.form === VerbForm.past) {
      this.requireSubject();
    }

    const words: Word[] = [
      {
        text: this.getVerbForm(),
        form: this.form,
        role: this.role,
      },
    ];

    if (this.negative) {
      if (this.contract) {
        words[0] = contractedNegative(`${words[0].text}n't`, this.role);
      } else {
        words.push({
          text: "not",
          role: WordRole.negation,
          form: "adverb",
        });
      }
    }

    return words;
  }
}

export enum VerbForm {
  base = "base",
  present = "present",
  past = "past",
  ing = "ing",
  v3 = "v3",
}

export enum VerbSpelling {
  thirdSingular = "thirdSingular",
  ing = "ing",
  past = "past", // past indefinite (v2) form for irregular verbs
  v3 = "v3", // participle II (v3) for irregular verbs
  ed = "ed", // v2 end v3 form for regular verbs
}

export type VerbVariants = {
  [key in VerbSpelling]?: string;
};

export type VerbSpellingList = {
  [key: string]: VerbVariants;
};
