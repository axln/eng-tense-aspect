import type { Word } from "~/type";
import { WordRole } from "~/type";

// In English a chain of verbs works as one verb: "have been going" is a single
// verb phrase, and only its first word takes the tense and the agreement. This
// finds that phrase in a finished sentence so the UI can frame it.

// What belongs to the phrase. The negation sits inside it: "has not been
// going". The subject, the object and the end mark never do.
const phraseRoles = new Set<WordRole>([
  WordRole.modal,
  WordRole.aux,
  WordRole.passive,
  WordRole.verb,
  WordRole.negation,
]);

// A contracted word is several words at once, so look at each of its parts:
// "hasn't" is the auxiliary plus the negation, and "I'm" is the subject plus
// the auxiliary, which puts it in the phrase.
function rolesOf(word: Word): WordRole[] {
  return word.parts ? word.parts.map((part) => part.role) : [word.role];
}

export function isInPhrase(word: Word): boolean {
  return rolesOf(word).some((role) => phraseRoles.has(role));
}

// A word that is a verb of the chain, as opposed to a "not" on its own. The
// negation does not make a phrase: "He is not hungry" has one verb, "is".
function isChainVerb(word: Word): boolean {
  return rolesOf(word).some((role) => phraseRoles.has(role) && role !== WordRole.negation);
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
//   "does not buy"). A lone verb, "goes" or "is hungry", is just a verb.
// - In a question the subject moves inside the chain ("Have YOU been going?"),
//   so the phrase comes in two runs. Each run is its own chunk, so the sentence
//   shows one unit interrupted by the subject.
// - A contracted word that holds part of the phrase belongs to it as a whole
//   ("I'm" in "I'm asked"): it is one word on the page, and its stripes still
//   say that the "I" in it is the subject.
export function groupVerbPhrase(words: Word[]): Chunk[] {
  const isPhrase = words.filter(isChainVerb).length >= 2;
  const chunks: Chunk[] = [];

  for (const word of words) {
    const last = chunks[chunks.length - 1];

    if (isPhrase && isInPhrase(word)) {
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
