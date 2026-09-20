import { describe, expect, it } from "vitest";
import { ModalVerb } from "~/lib/Modal";
import { SentenceMode } from "~/lib/Sentence";
import { words, type SayOptions } from "~/lib/testHelper";
import { groupVerbPhrase, isInPhrase } from "~/lib/VerbPhrase";
import { WordRole } from "~/type";

const modalMode = SentenceMode.ModalVerb;

// The framed runs of a sentence, as their words' texts
function frames(options: SayOptions): string[][] {
  return groupVerbPhrase(words(options))
    .filter((chunk) => chunk.verbPhrase)
    .map((chunk) => chunk.words.map((word) => word.text));
}

// Every chunk in order, marked as framed or not, to see where the subject falls
function layout(options: SayOptions): [boolean, string[]][] {
  return groupVerbPhrase(words(options)).map((chunk) => [
    chunk.verbPhrase,
    chunk.words.map((word) => word.text),
  ]);
}

describe("a chain of verbs is one verb phrase", () => {
  it("have been going", () => {
    expect(frames({ subject: "I", verb: "go:i", perfect: true, continuous: true })).toEqual([
      ["have", "been", "going"],
    ]);
  });

  it("two verbs are enough", () => {
    expect(frames({ verb: "go:i", perfect: true })).toEqual([["has", "gone"]]);
    expect(frames({ subject: "it", verb: "buy:i", passive: true })).toEqual([["is", "bought"]]);
    expect(frames({ verb: "go:i", continuous: true })).toEqual([["is", "going"]]);
  });

  it("all three aspects together", () => {
    expect(
      frames({ subject: "it", verb: "buy:i", perfect: true, continuous: true, passive: true })
    ).toEqual([["has", "been", "being", "bought"]]);
  });

  it("modals take part", () => {
    expect(frames({ mode: modalMode, modal: ModalVerb.will })).toEqual([["will", "go"]]);
    expect(
      frames({ mode: modalMode, modal: ModalVerb.will, perfect: true, continuous: true })
    ).toEqual([["will", "have", "been", "going"]]);
  });

  it("do-support makes a phrase too: does not buy", () => {
    expect(frames({ verb: "buy:i", negative: true })).toEqual([["does", "not", "buy"]]);
  });
});

describe("a single verb is not a phrase", () => {
  it("a plain verb", () => {
    expect(frames({ verb: "go:i" })).toEqual([]);
    expect(frames({ verb: "go:i", mode: SentenceMode.PastTense })).toEqual([]);
  });

  it("be as the main verb", () => {
    expect(frames({ verb: "be:s", object: "hungry" })).toEqual([]);
    expect(frames({ subject: "I", verb: "be:s", object: "hungry", contract: true })).toEqual([]);
  });

  // "not" does not make a phrase: "is not hungry" has one verb
  it("a negation alone does not count as a second verb", () => {
    expect(frames({ verb: "be:s", object: "hungry", negative: true })).toEqual([]);
    expect(frames({ verb: "be:s", object: "hungry", negative: true, contract: true })).toEqual([]);
  });
});

describe("the negation sits inside the phrase", () => {
  it("uncontracted, as its own word", () => {
    expect(frames({ verb: "go:i", perfect: true, negative: true })).toEqual([
      ["has", "not", "gone"],
    ]);
  });

  it("contracted, fused into the verb", () => {
    expect(frames({ verb: "go:i", perfect: true, negative: true, contract: true })).toEqual([
      ["hasn't", "gone"],
    ]);
    expect(frames({ verb: "buy:i", negative: true, contract: true })).toEqual([
      ["doesn't", "buy"],
    ]);
    expect(
      frames({ mode: modalMode, modal: ModalVerb.can, negative: true, contract: true })
    ).toEqual([["can't", "go"]]);
  });
});

describe("what is outside the phrase", () => {
  it("the subject, the object and the end mark", () => {
    const chunks = groupVerbPhrase(
      words({ subject: "I", verb: "buy:i", perfect: true, object: "a phone" })
    );

    expect(chunks.map((c) => [c.verbPhrase, c.words.map((w) => w.text)])).toEqual([
      [false, ["I"]],
      [true, ["have", "bought"]],
      [false, ["a phone"]],
      [false, ["."]],
    ]);
  });

  // "I'm" is one word on the page, so it is framed whole; its stripes still
  // say that the "I" in it is the subject
  it("a contracted word that holds part of the phrase is framed whole", () => {
    const [first] = groupVerbPhrase(
      words({ subject: "I", verb: "ask:r", passive: true, contract: true })
    );

    expect(first.verbPhrase).toBe(true);
    expect(first.words.map((w) => w.text)).toEqual(["I'm", "asked"]);
    expect(first.words[0].parts?.map((p) => p.role)).toEqual([WordRole.subject, WordRole.passive]);
  });

  it("but a contracted copula alone is still one verb", () => {
    expect(frames({ verb: "be:s", object: "hungry", contract: true })).toEqual([]);
  });
});

describe("in a question the subject splits the phrase", () => {
  it("Have YOU been going?", () => {
    expect(
      layout({ subject: "you", verb: "go:i", perfect: true, continuous: true, interrogative: true })
    ).toEqual([
      [true, ["Have"]],
      [false, ["you"]],
      [true, ["been", "going"]],
      [false, ["?"]],
    ]);
  });

  it("Does HE buy a phone?", () => {
    expect(layout({ verb: "buy:i", object: "a phone", interrogative: true })).toEqual([
      [true, ["Does"]],
      [false, ["he"]],
      [true, ["buy"]],
      [false, ["a phone"]],
      [false, ["?"]],
    ]);
  });

  it("a modal question", () => {
    expect(frames({ mode: modalMode, modal: ModalVerb.can, interrogative: true })).toEqual([
      ["Can"],
      ["go"],
    ]);
  });

  it("the negation goes with the second run", () => {
    expect(frames({ verb: "buy:i", negative: true, interrogative: true })).toEqual([
      ["Does"],
      ["not", "buy"],
    ]);
    expect(frames({ verb: "buy:i", negative: true, interrogative: true, contract: true })).toEqual([
      ["Doesn't"],
      ["buy"],
    ]);
  });

  it("a question with a single verb has no phrase", () => {
    expect(frames({ verb: "be:s", object: "hungry", interrogative: true })).toEqual([]);
  });
});

// The rules, checked in every combination.
describe("in every combination", () => {
  const subjects = ["I", "we", "you", "he", "she", "it", "they"];
  const verbs = ["be:s", "have:i", "go:i", "buy:i", "do:i"];
  const modes = [
    { mode: SentenceMode.PresentTense },
    { mode: SentenceMode.PastTense },
    ...Object.values(ModalVerb).map((m) => ({ mode: modalMode, modal: m })),
  ];
  const flag = [false, true];

  const sentences: ReturnType<typeof words>[] = [];
  for (const subject of subjects)
    for (const verb of verbs)
      for (const m of modes)
        for (const passive of flag)
          for (const continuous of flag)
            for (const perfect of flag)
              for (const negative of flag)
                for (const interrogative of flag)
                  for (const contract of flag)
                    sentences.push(
                      words({
                        subject,
                        verb,
                        ...m,
                        object: "a thing",
                        passive,
                        continuous,
                        perfect,
                        negative,
                        interrogative,
                        contract,
                      })
                    );

  // Counted here from scratch, not with the code under test: the words that
  // are a verb of the chain, so a "not" on its own is not one
  const chainRoles = new Set<WordRole>([WordRole.modal, WordRole.aux, WordRole.passive, WordRole.verb]);
  const chainLength = (ws: ReturnType<typeof words>) =>
    ws.filter((w) => (w.parts?.map((p) => p.role) ?? [w.role]).some((r) => chainRoles.has(r)))
      .length;

  it("checks plenty of sentences", () => {
    expect(sentences.length).toBeGreaterThan(20000);
  });

  it("no word is lost or moved", () => {
    const wrong = sentences.filter(
      (ws) =>
        groupVerbPhrase(ws)
          .flatMap((c) => c.words.map((w) => w.text))
          .join("|") !== ws.map((w) => w.text).join("|")
    );

    expect(wrong.length).toBe(0);
  });

  it("only words of the phrase are framed", () => {
    const wrong = sentences.filter((ws) =>
      groupVerbPhrase(ws).some((c) => c.verbPhrase && !c.words.every(isInPhrase))
    );

    expect(wrong.length).toBe(0);
  });

  it("the object and the end mark are never framed", () => {
    const wrong = sentences.filter((ws) =>
      groupVerbPhrase(ws).some(
        (c) =>
          c.verbPhrase &&
          c.words.some((w) => w.role === WordRole.object || w.role === WordRole.end)
      )
    );

    expect(wrong.length).toBe(0);
  });

  it("a plain subject is never framed; only a contraction that holds one can be", () => {
    const wrong = sentences.filter((ws) =>
      groupVerbPhrase(ws).some(
        (c) => c.verbPhrase && c.words.some((w) => w.role === WordRole.subject && !w.parts)
      )
    );

    expect(wrong.length).toBe(0);
  });

  it("there is a frame exactly when the chain has two verbs", () => {
    const wrong = sentences.filter((ws) => {
      const framed = groupVerbPhrase(ws).some((c) => c.verbPhrase);

      return framed !== chainLength(ws) >= 2;
    });

    expect(wrong.length).toBe(0);
  });

  it("every verb of the chain is inside a frame when there is one", () => {
    const wrong = sentences.filter((ws) => {
      const chunks = groupVerbPhrase(ws);

      return (
        chunks.some((c) => c.verbPhrase) &&
        chunks.some((c) => !c.verbPhrase && c.words.some(isInPhrase))
      );
    });

    expect(wrong.length).toBe(0);
  });

  it("runs are maximal: two frames are never next to each other", () => {
    const wrong = sentences.filter((ws) => {
      const chunks = groupVerbPhrase(ws);

      return chunks.some((c, i) => c.verbPhrase && chunks[i + 1]?.verbPhrase);
    });

    expect(wrong.length).toBe(0);
  });

  it("a statement has at most one frame; only a question splits it in two", () => {
    const counts = sentences.map((ws) => groupVerbPhrase(ws).filter((c) => c.verbPhrase).length);

    expect(Math.max(...counts)).toBe(2);
    expect(
      sentences.some(
        (ws, i) => counts[i] === 2 && !ws.some((w) => w.text === "?")
      )
    ).toBe(false);
  });
});
