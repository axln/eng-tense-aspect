import { GrammarPerson } from "~/type";
import { Verb, VerbForm } from "~/lib/Verb";

export class BeVerb extends Verb {
  getVerbForm(): string {
    switch (this.form) {
      case VerbForm.base:
        return "be";

      case VerbForm.ing:
        return "being";

      case VerbForm.v3:
        return "been";

      case VerbForm.present:
        if (this.subject.isThirdSingular()) {
          return "is";
        } else if (
          this.subject.isPlural() ||
          this.subject.info.grammarPerson === GrammarPerson.second
        ) {
          return "are";
        } else {
          return "am";
        }

      case VerbForm.past:
        if (this.subject.isSingular()) {
          return "was";
        } else {
          return "were";
        }
    }
  }
}
