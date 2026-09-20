import type { Word } from "~/type";
import { WordRole } from "~/type";
import { BaseVerb } from "~/lib/BaseVerb";

export class Modal extends BaseVerb {
  renderToWords(): Word[] {
    const words = this.base.split("_").map((text) => ({
      text,
      role: WordRole.modal,
    }));

    if (this.negative) {
      if (this.contract) {
        words[0].text = contractNegative(this.base);
      } else {
        const notAdverb = {
          text: "not",
          role: WordRole.negation,
          form: "adverb",
        };

        if (this.base === "had_better") {
          words.push(notAdverb);
        } else {
          words.splice(1, 0, notAdverb);
        }
      }
    }
    return words;
  }
}

function contractNegative(modal: string): string {
  switch (modal) {
    case "can":
      return "can't";
    case "will":
      return "won't";
    case "shall":
      return "shan't";
    default:
      return modal + "n't";
  }
}

export enum ModalVerb {
  could = "could",
  can = "can",
  might = "might",
  may = "may",
  would = "would",
  will = "will",
  should = "should",
  shall = "shall",
  must = "must",
  ought_to = "ought_to",
  had_better = "had_better",
}
