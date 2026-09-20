import { describe, expect, it } from "vitest";
import { ModalVerb } from "~/lib/Modal";
import { SentenceMode } from "~/lib/Sentence";
import { words, type SayOptions } from "~/lib/testHelper";
import { WordRole } from "~/type";

const { subject, aux, passive, verb, modal, negation } = WordRole;
const past = SentenceMode.PastTense;
const modalMode = SentenceMode.ModalVerb;

// The contracted word of a sentence, as [text, role][] pairs
function partsOf(options: SayOptions, index = 0) {
  const word = words({ contract: true, ...options })[index];

  return word.parts?.map((part) => [part.text, part.role]);
}

// A contracted word is several words written as one, and each part keeps the
// role it had before they merged. The colours of the tile follow from this.
describe("a contracted word carries the role of each part", () => {
  describe("subject + auxiliary", () => {
    it("I'm asked: the subject and the passive auxiliary", () => {
      expect(partsOf({ subject: "I", verb: "ask:r", passive: true })).toEqual([
        ["I", subject],
        ["'m", passive],
      ]);
    });

    it("It's bought: passive again", () => {
      expect(partsOf({ subject: "it", verb: "buy:i", passive: true })).toEqual([
        ["It", subject],
        ["'s", passive],
      ]);
    });

    it("I'm buying: the continuous auxiliary", () => {
      expect(partsOf({ subject: "I", verb: "buy:i", continuous: true })).toEqual([
        ["I", subject],
        ["'m", aux],
      ]);
    });

    it("I've bought: the perfect auxiliary", () => {
      expect(partsOf({ subject: "I", verb: "buy:i", perfect: true })).toEqual([
        ["I", subject],
        ["'ve", aux],
      ]);
    });

    it("He'd bought: past perfect", () => {
      expect(partsOf({ subject: "he", verb: "buy:i", perfect: true, mode: past })).toEqual([
        ["He", subject],
        ["'d", aux],
      ]);
    });
  });

  describe("subject + copula", () => {
    it("He's hungry: be as the main verb", () => {
      expect(partsOf({ subject: "he", verb: "be:s", object: "hungry" })).toEqual([
        ["He", subject],
        ["'s", verb],
      ]);
    });
  });

  describe("subject + modal", () => {
    it("I'll go", () => {
      expect(partsOf({ subject: "I", mode: modalMode, modal: ModalVerb.will })).toEqual([
        ["I", subject],
        ["'ll", modal],
      ]);
    });

    it("I'd better go: had better is a modal", () => {
      expect(partsOf({ subject: "I", mode: modalMode, modal: ModalVerb.had_better })).toEqual([
        ["I", subject],
        ["'d", modal],
      ]);
    });
  });

  describe("modal + auxiliary", () => {
    it("should've gone", () => {
      const opts = { subject: "he", mode: modalMode, modal: ModalVerb.should, perfect: true };

      // "he" then "should've"
      expect(partsOf(opts, 1)).toEqual([
        ["should", modal],
        ["'ve", aux],
      ]);
    });
  });

  describe("verb + negation", () => {
    it.each([
      ["hasn't: perfect auxiliary", { subject: "he", verb: "buy:i", perfect: true }, 1, [["has", aux]]],
      ["don't: do-support", { subject: "I", verb: "buy:i" }, 1, [["do", aux]]],
      ["doesn't: do-support, third person", { subject: "he", verb: "buy:i" }, 1, [["does", aux]]],
      ["isn't: the copula", { subject: "he", verb: "be:s", object: "late" }, 1, [["is", verb]]],
      ["aren't: the copula", { subject: "they", verb: "be:s", object: "late" }, 1, [["are", verb]]],
      ["isn't: continuous auxiliary", { subject: "he", verb: "buy:i", continuous: true }, 1, [["is", aux]]],
      ["isn't: passive auxiliary", { subject: "it", verb: "buy:i", passive: true }, 1, [["is", passive]]],
    ])("%s", (_name, opts, index, [[stem, stemRole]]) => {
      expect(partsOf({ ...opts, negative: true } as SayOptions, index)).toEqual([
        [stem, stemRole],
        ["n't", negation],
      ]);
    });

    it("Aren't I late: the suppletive form keeps both parts", () => {
      expect(
        partsOf({ subject: "I", verb: "be:s", object: "late", negative: true, interrogative: true })
      ).toEqual([
        ["Are", verb],
        ["n't", negation],
      ]);
    });
  });

  describe("modal + negation", () => {
    it.each([
      [ModalVerb.can, "ca"],
      [ModalVerb.will, "wo"],
      [ModalVerb.could, "could"],
      [ModalVerb.should, "should"],
      [ModalVerb.must, "must"],
    ])("%s: the stem is %s, so ca|n't and wo|n't cut in the right place", (m, stem) => {
      expect(partsOf({ subject: "I", mode: modalMode, modal: m, negative: true }, 1)).toEqual([
        [stem, modal],
        ["n't", negation],
      ]);
    });
  });

  it("cannot: no apostrophe, so it splits at the first word's length", () => {
    // contractions off: "can not" -> "cannot" is always applied
    const word = words({ subject: "I", mode: modalMode, modal: ModalVerb.can, negative: true })[1];

    expect(word.text).toBe("cannot");
    expect(word.parts?.map((p) => [p.text, p.role])).toEqual([
      ["can", modal],
      ["not", negation],
    ]);
  });
});

describe("what does not have parts", () => {
  it("a word that is not contracted", () => {
    for (const word of words({ subject: "I", verb: "buy:i", perfect: true, object: "a phone" })) {
      expect(word.parts).toBeUndefined();
    }
  });

  it("the separate not, when contractions are off", () => {
    const sentence = words({ subject: "he", verb: "buy:i", negative: true });

    expect(sentence.every((word) => word.parts === undefined)).toBe(true);
  });
});

describe("capitalization keeps the text and the parts in step", () => {
  it("the first word, He's", () => {
    const [first] = words({ subject: "he", verb: "be:s", object: "late", contract: true });

    expect(first.text).toBe("He's");
    expect(first.parts?.map((p) => p.text)).toEqual(["He", "'s"]);
  });

  it("the pronoun I, wherever it stands", () => {
    const [first] = words({ subject: "I", verb: "buy:i", perfect: true, contract: true });

    expect(first.text).toBe("I've");
    expect(first.parts?.map((p) => p.text)).toEqual(["I", "'ve"]);
  });

  it("the first word, when it is a contracted negative", () => {
    const [first] = words({
      subject: "he",
      verb: "buy:i",
      negative: true,
      interrogative: true,
      contract: true,
    });

    expect(first.text).toBe("Doesn't");
    expect(first.parts?.map((p) => p.text)).toEqual(["Does", "n't"]);
  });
});

// The rule behind all of the above, checked in every combination.
describe("every contracted word is well formed", () => {
  const subjects = ["I", "we", "you", "he", "she", "it", "they"];
  const verbs = ["be:s", "have:i", "go:i", "buy:i", "do:i"];
  const modes = [
    { mode: SentenceMode.PresentTense },
    { mode: past },
    ...Object.values(ModalVerb).map((m) => ({ mode: modalMode, modal: m })),
  ];
  const flag = [false, true];

  const all: ReturnType<typeof words> = [];
  for (const subject of subjects)
    for (const verb of verbs)
      for (const m of modes)
        for (const passive of flag)
          for (const continuous of flag)
            for (const perfect of flag)
              for (const negative of flag)
                for (const interrogative of flag)
                  for (const contract of flag)
                    all.push(
                      ...words({
                        subject,
                        verb,
                        ...m,
                        passive,
                        continuous,
                        perfect,
                        negative,
                        interrogative,
                        contract,
                      })
                    );

  const contracted = all.filter((word) => word.form === "ctr");

  it("finds plenty of contracted words to check", () => {
    expect(contracted.length).toBeGreaterThan(5000);
  });

  it("every contracted word has parts, and only contracted words do", () => {
    expect(all.filter((word) => (word.form === "ctr") !== (word.parts !== undefined))).toEqual([]);
  });

  it("there are at least two parts", () => {
    expect(contracted.filter((word) => (word.parts?.length ?? 0) < 2)).toEqual([]);
  });

  it("the parts add up to the word: no letter lost or invented", () => {
    const wrong = contracted.filter((word) => word.parts?.map((p) => p.text).join("") !== word.text);

    expect(wrong.slice(0, 3)).toEqual([]);
  });

  it("the word takes the role of its first part", () => {
    expect(contracted.filter((word) => word.role !== word.parts?.[0].role)).toEqual([]);
  });

  it("no part is empty", () => {
    expect(contracted.filter((word) => word.parts?.some((p) => p.text === ""))).toEqual([]);
  });

  it("the end punctuation and the object are never part of a contraction", () => {
    const roles = new Set(contracted.flatMap((word) => word.parts?.map((p) => p.role) ?? []));

    expect(roles.has(WordRole.end)).toBe(false);
    expect(roles.has(WordRole.object)).toBe(false);
  });
});
