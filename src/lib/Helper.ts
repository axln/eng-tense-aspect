import type { Word } from "~/type";
import { WordRole } from "~/type";
import type { ContractionRule } from "~/spelling/Contractions";

// No other English verb is spelled any of these, so a word carrying the verb
// role and one of these spellings is the copula "be".
const beForms = new Set(["am", "is", "are", "was", "were"]);

// English blocks a subject+verb contraction in three cases:
//
// 1. the verb is stranded at the end of the clause, with the rest elided:
//    "Yes, he is." never "Yes, he's.", "taller than I am." never "than I'm.";
// 2. the verb is a semantic verb rather than an auxiliary: "I have a car",
//    not "I've a car";
// 3. the modal is being negated: "I shall not go", not the archaic "I'll not
//    go". (Modals with a contracted negative have already become "won't",
//    "mustn't" and so on, so shall is the only one that gets this far.)
//
// The copula is the exception to the second case. It carries the verb role
// here because it is the only verb in the chain, but "He's hungry." is the
// ordinary way to say it, so it contracts like an auxiliary.
function contractible(
  secondWord: Word,
  nextWord: Word | undefined,
  clauseFinal: boolean
): boolean {
  if (clauseFinal) {
    return false;
  }

  if (secondWord.role === WordRole.modal && nextWord?.role === WordRole.negation) {
    return false;
  }

  return secondWord.role !== WordRole.verb || beForms.has(secondWord.text);
}

export function applyContraction(
  words: Word[],
  contraction: ContractionRule
): Word[] {
  const newWords: Word[] = [];

  for (let i = 0; i < words.length; ++i) {
    if (i < words.length - 1) {
      const firstWord = words[i];
      const secondWord = words[i + 1];

      // the end punctuation has not been appended yet, so the last word of
      // the array is the last word of the clause
      const clauseFinal = i + 1 === words.length - 1;

      if (
        `${firstWord.text} ${secondWord.text}` === contraction.from &&
        contractible(secondWord, words[i + 2], clauseFinal)
      ) {
        newWords.push({
          text: contraction.to,
          role: firstWord.role,
          form: "ctr",
        });
        ++i; // skip the next word
      } else {
        newWords.push(words[i]);
      }
    } else {
      newWords.push(words[i]);
    }
  }
  return newWords;
}

export function applyContractions(
  words: Word[],
  contractions: ContractionRule[]
): Word[] {
  for (const contraction of contractions) {
    words = applyContraction(words, contraction);
  }
  return words;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// The pronoun "i" is kept lowercase like every other word so that the
// contraction rules can match it. It is the one word that must be capitalized
// wherever it stands, so it is restored here, after contractions have run:
// "i" itself and its contracted forms "i'm", "i've", "i'd", "i'll".
export function capitalizePronounI(words: Word[]): Word[] {
  return words.map((word) =>
    word.text === "i" || word.text.startsWith("i'")
      ? { ...word, text: capitalize(word.text) }
      : word
  );
}
