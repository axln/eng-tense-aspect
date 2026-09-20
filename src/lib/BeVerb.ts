import type { Word } from "~/type";
import { GrammarPerson, WordRole } from "~/type";
import { Verb, VerbForm } from "~/lib/Verb";
import { contractedNegative } from "~/lib/Helper";

export class BeVerb extends Verb {
  // "am not" is the gap in the negation paradigm: there is no standard
  // "amn't". English fills it two different ways, so this is the one verb
  // whose negation depends on the kind of sentence.
  renderToWords(): Word[] {
    if (this.negative && this.contract && this.subject && this.getVerbForm() === "am") {
      // a question takes suppletive "aren't": "Aren't I late?"
      if (this.interrogative) {
        return [contractedNegative("aren't", this.role)];
      }

      // a statement contracts the subject instead and leaves "not" alone,
      // giving "I'm not late" once applyContractions has run
      return [
        {
          text: "am",
          form: this.form,
          role: this.role,
        },
        {
          text: "not",
          role: WordRole.negation,
          form: "adverb",
        },
      ];
    }

    return super.renderToWords();
  }

  getVerbForm(): string {
    switch (this.form) {
      case VerbForm.base:
        return "be";

      case VerbForm.ing:
        return "being";

      case VerbForm.v3:
        return "been";

      case VerbForm.present: {
        const subject = this.requireSubject();

        if (subject.isThirdSingular()) {
          return "is";
        } else if (
          subject.isPlural() ||
          subject.info.grammarPerson === GrammarPerson.second
        ) {
          return "are";
        } else {
          return "am";
        }
      }

      case VerbForm.past:
        return this.requireSubject().isSingular() ? "was" : "were";
    }
  }
}
