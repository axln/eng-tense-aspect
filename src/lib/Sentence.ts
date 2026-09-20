import type { Word } from "~/type";
import { Verb, VerbForm } from "~/lib/Verb";
import { BeVerb } from "~/lib/BeVerb";
import { BaseVerb } from "~/lib/BaseVerb";
import { IrregularVerb } from "~/lib/IrregularVerb";
import { contractions } from "~/spelling/Contractions";
import { WordRole } from "~/type";
import { Pronoun } from "~/lib/Pronoun";
import { Modal } from "~/lib/Modal";
import {
  applyContractions,
  applyContraction,
  capitalizeWord,
  capitalizePronounI,
} from "~/lib/Helper";

function buildVerbChain(verb: Verb, verbMode: VerbMode): BaseVerb[] {
  const verbs = [verb];

  if (verbMode.passive) {
    verbs[0].form = VerbForm.v3;
    verbs.unshift(new BeVerb("be", WordRole.passive));
  }

  if (verbMode.continuous) {
    verbs[0].form = VerbForm.ing;
    verbs.unshift(new BeVerb("be", WordRole.aux));
  }

  if (verbMode.perfect) {
    verbs[0].form = VerbForm.v3;
    verbs.unshift(new IrregularVerb("have", WordRole.aux));
  }

  // console.log('verbs:', JSON.stringify(verbs, null, 2));

  return verbs;
}

export function buildSentence({
  mode,
  modalVerb,
  verb,
  negative,
  verbMode,
  interrogative,
  subject,
  contract,
  object,
}: SentenceParams): Word[] {
  const verbChain = buildVerbChain(verb, verbMode);
  // const { mode, modalVerb, negative, interrogative } = params;

  if (mode == SentenceMode.ModalVerb && modalVerb) {
    verbChain.unshift(modalVerb);
  } else {
    // making the first verb in chain personal by applying tense and subject (person and number)
    const firstVerb = verbChain[0] as Verb;
    // Negatives and questions need do-support unless the first verb is be or
    // an auxiliary have. Main-verb have needs it: "I don't have a car", not
    // the formal "I haven't a car" - and only the role tells the two apart.
    const isBe = firstVerb.base === "be";
    const isAuxHave =
      firstVerb.base === "have" && firstVerb.role === WordRole.aux;

    if ((interrogative || negative) && !isBe && !isAuxHave) {
      verbChain.unshift(new IrregularVerb("do", WordRole.aux));
    }
    (verbChain[0] as Verb).makePersonal(
      subject,
      mode === SentenceMode.PresentTense
    );
  }

  if (negative) {
    verbChain[0].negative = true;
    verbChain[0].contract = contract;
    verbChain[0].interrogative = interrogative;
  }

  let words = verbChain.reduce((arr, verb) => {
    arr.push(...verb.renderToWords());
    return arr;
  }, [] as Word[]);

  // add subject
  if (interrogative) {
    // place subject after first verb in chain: interrogative inversion
    words.splice(1, 0, subject.renderToWord());
  } else {
    words.unshift(subject.renderToWord());
  }

  // the object (complement) closes the sentence, after the whole verb chain
  if (object) {
    words.push({
      text: object,
      role: WordRole.object,
    });
  }

  // apply contractions
  if (contract) {
    words = applyContractions(words, contractions);
  }

  // always applied: "can not" => "cannot"
  words = applyContraction(words, {
    from: "can not",
    to: "cannot",
  });

  // always applied: "i" is uppercase wherever it stands in the sentence
  words = capitalizePronounI(words);

  // capitalize and finalize
  words.push({
    text: interrogative ? "?" : ".",
    role: WordRole.end,
  });
  words[0] = capitalizeWord(words[0]);

  return words;
}

export type VerbMode = {
  passive: boolean;
  continuous: boolean;
  perfect: boolean;
};

export type SentenceParams = {
  mode: SentenceMode;
  subject: Pronoun;
  modalVerb?: Modal;
  verb: Verb;
  verbMode: VerbMode;
  negative: boolean;
  interrogative: boolean;
  contract: boolean;
  object?: string;
};

export enum SentenceMode {
  PastTense = "PastTense",
  PresentTense = "PresentTense",
  ModalVerb = "Modal",
}
