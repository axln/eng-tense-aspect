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
  capitalize,
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
}: SentenceParams): Word[] {
  const verbChain = buildVerbChain(verb, verbMode);
  // const { mode, modalVerb, negative, interrogative } = params;

  if (mode == SentenceMode.ModalVerb && modalVerb) {
    verbChain.unshift(modalVerb);
  } else {
    // making the first verb in chain personal by applying tense and subject (person and number)
    const firstVerb = verbChain[0] as Verb;
    // if first verb isn't be or have, we must use do-support for negative and interrogative
    if (
      (interrogative || negative) &&
      !["be", "have"].includes(firstVerb.base)
    ) {
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
  words[0].text = capitalize(words[0].text);

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
};

export enum SentenceMode {
  PastTense = "PastTense",
  PresentTense = "PresentTense",
  ModalVerb = "Modal",
}
