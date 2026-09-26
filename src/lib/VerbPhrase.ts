import type { Word } from "~/type";
import { WordRole } from "~/type";

// In English a chain of verbs works as one verb: "have been going" is a single
// verb phrase, and only its first word takes the tense and the agreement. This
// finds that phrase in a finished sentence so the UI can frame it.

// The verbs of the chain. The modal is not one of them: it says what kind of
// sentence this is, so "will have gone" frames "have gone" and "will go" has
// no frame at all.
const chainRoles = new Set<WordRole>([WordRole.aux, WordRole.passive, WordRole.verb]);

// A contracted word is several words at once, so look at each of its parts:
// "hasn't" is the auxiliary plus the negation, and "I'm" is the subject plus
// the auxiliary, which puts it in the phrase.
function rolesOf(word: Word): WordRole[] {
  return word.parts ? word.parts.map((part) => part.role) : [word.role];
}

function hasModal(sentence: Word[]): boolean {
  return sentence.some((word) => rolesOf(word).includes(WordRole.modal));
}

// What belongs to the phrase. The negation sits inside it ("has not been
// going"), unless there is a modal: then the negation is the modal's ("must
// not", "can't", "ought not to") and stays outside with it. The subject, the
// object and the end mark never belong.
function phraseRoles(sentence: Word[]): Set<WordRole> {
  return hasModal(sentence) ? chainRoles : new Set([...chainRoles, WordRole.negation]);
}

// Whether a word of the given sentence belongs to its verb phrase
export function isInPhrase(word: Word, sentence: Word[]): boolean {
  const roles = phraseRoles(sentence);

  return rolesOf(word).some((role) => roles.has(role));
}

// A word that is a verb of the chain, as opposed to a "not" on its own. The
// negation does not make a phrase: "He is not hungry" has one verb, "is".
function isChainVerb(word: Word): boolean {
  return rolesOf(word).some((role) => chainRoles.has(role));
}

// One piece of the sentence: either a run of words inside the verb phrase, or
// a single word outside it.
export type Chunk = {
  words: Word[];
  verbPhrase: boolean;
};

// Splits a sentence into the words of the verb phrase and everything else.
//
// - A phrase needs at least two verbs of the chain ("have been going",
//   "does not buy"). A lone verb, "goes" or "is hungry", is just a verb, and
//   so is "go" in "will go", since the modal is not counted.
// - In a question the subject moves inside the chain ("Have YOU been going?"),
//   so the phrase comes in two runs. Each run is its own chunk, so the sentence
//   shows one unit interrupted by the subject.
// - A contracted word that holds part of the phrase belongs to it as a whole
//   ("I'm" in "I'm asked", "should've" in "should've gone"): it is one word on
//   the page, and its stripes still say what each part of it is.
export function groupVerbPhrase(words: Word[]): Chunk[] {
  const isPhrase = words.filter(isChainVerb).length >= 2;
  const roles = phraseRoles(words);
  const chunks: Chunk[] = [];

  for (const word of words) {
    const last = chunks[chunks.length - 1];

    if (isPhrase && rolesOf(word).some((role) => roles.has(role))) {
      if (last?.verbPhrase) {
        last.words.push(word);
      } else {
        chunks.push({ words: [word], verbPhrase: true });
      }
    } else {
      chunks.push({ words: [word], verbPhrase: false });
    }
  }

  return chunks;
}
