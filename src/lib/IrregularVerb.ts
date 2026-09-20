import type { VerbVariants } from "~/lib/Verb";
import { Verb } from "~/lib/Verb";
import { irregularVerbList } from "~/spelling/IrregularVerbList";

export class IrregularVerb extends Verb {
  getSpellingInfo(verbBase: string): VerbVariants {
    return irregularVerbList[verbBase];
  }
}
