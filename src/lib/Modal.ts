import type { Word } from "~/type";
import { WordRole } from "~/type";
import { BaseVerb } from "~/lib/BaseVerb";
import { contractedNegative } from "~/lib/Helper";

export class Modal extends BaseVerb {
  renderToWords(): Word[] {
    const words: Word[] = this.base.split("_").map((text) => ({
      text,
      role: WordRole.modal,
    }));

    if (this.negative) {
      const contracted = this.contract ? negativeContractions[this.base] : undefined;

      if (contracted) {
        words[0] = contractedNegative(contracted, WordRole.modal);
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

// Only the modals with an everyday contracted negative. The rest keep "not" as
// a separate word: "may not", "might not", "shall not", "ought not to", "had
// better not". Appending "n't" to anything else produces forms an ESL learner
// should never meet — the archaic "mayn't" and "shan't", or nonsense like
// "ought_ton't" from the two-word modals.
const negativeContractions: { [key: string]: string } = {
  can: "can't",
  could: "couldn't",
  will: "won't",
  would: "wouldn't",
  should: "shouldn't",
  must: "mustn't",
};

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
