import type { Word, WordPart } from "~/type";
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

// A contracted word is several words written as one, and each part keeps its
// own role: "I'm" in "I'm asked" is the subject plus the passive auxiliary, and
// "hasn't" is the auxiliary plus the negation. `text` and `role` stay what they
// always were, so anything that ignores the parts still works.
export function contractedWord(parts: WordPart[]): Word {
  return {
    text: parts.map((part) => part.text).join(""),
    role: parts[0].role,
    form: "ctr",
    parts,
  };
}

// "hasn't", "can't", "won't", "aren't": the verb, then the negation "n't".
// Every contracted negative ends in "n't", including the irregular "ca|n't" and
// "wo|n't", so the split is always the last three letters.
export function contractedNegative(text: string, role: WordRole): Word {
  const stem = text.slice(0, -"n't".length);

  return contractedWord([
    { text: stem, role },
    { text: "n't", role: WordRole.negation },
  ]);
}

// Merges two neighbouring words into one contraction. Where to cut the
// contracted spelling comes from the apostrophe ("he|'s", "should|'ve"); with
// none ("can not" -> "cannot") the first word's own length is the cut.
function mergeWords(first: Word, second: Word, text: string): Word {
  // a word that is already a contraction cannot be cut again from its
  // spelling; no rule produces one today, so keep it whole rather than guess
  if (first.parts || second.parts) {
    return { text, role: first.role, form: "ctr" };
  }

  const apostrophe = text.indexOf("'");
  const cut = apostrophe > 0 ? apostrophe : first.text.length;

  return contractedWord([
    { text: text.slice(0, cut), role: first.role },
    { text: text.slice(cut), role: second.role },
  ]);
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
        newWords.push(mergeWords(firstWord, secondWord, contraction.to));
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

// Capitalizes a word, and the first part of a contracted one so that its text
// and its parts still agree: "he's" is "he" + "'s", so it becomes "He" + "'s".
export function capitalizeWord(word: Word): Word {
  if (!word.parts) {
    return { ...word, text: capitalize(word.text) };
  }

  const [first, ...rest] = word.parts;

  return {
    ...word,
    text: capitalize(word.text),
    parts: [{ ...first, text: capitalize(first.text) }, ...rest],
  };
}

// The pronoun "i" is kept lowercase like every other word so that the
// contraction rules can match it. It is the one word that must be capitalized
// wherever it stands, so it is restored here, after contractions have run:
// "i" itself and its contracted forms "i'm", "i've", "i'd", "i'll".
export function capitalizePronounI(words: Word[]): Word[] {
  return words.map((word) =>
    word.text === "i" || word.text.startsWith("i'")
      ? capitalizeWord(word)
      : word
  );
}
