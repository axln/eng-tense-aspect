import type { Word } from "~/type";
import type { ContractionRule } from "~/spelling/Contractions";

export function applyContraction(
  words: Word[],
  contraction: ContractionRule
): Word[] {
  const newWords: Word[] = [];

  for (let i = 0; i < words.length; ++i) {
    if (i < words.length - 1) {
      const firstWord = words[i];
      const secondWord = words[i + 1];

      if (
        `${firstWord.text} ${secondWord.text}` === contraction.from &&
        secondWord.role !== "verb" // we don't contract semantic verbs
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
