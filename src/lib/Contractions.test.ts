import { describe, expect, it } from "vitest";
import { ModalVerb } from "~/lib/Modal";
import { SentenceMode } from "~/lib/Sentence";
import { say } from "~/lib/testHelper";

const past = SentenceMode.PastTense;
const modal = SentenceMode.ModalVerb;

describe("a semantic verb is never contracted", () => {
  it("main-verb have: not \"I've a car\"", () => {
    expect(say({ subject: "I", verb: "have:i", object: "a car", contract: true })).toBe(
      "I have a car."
    );
    expect(say({ subject: "we", verb: "have:i", object: "a car", contract: true })).toBe(
      "We have a car."
    );
  });

  it("main-verb has and had: not \"he's a car\" or \"he'd a car\"", () => {
    expect(say({ subject: "he", verb: "have:i", object: "a car", contract: true })).toBe(
      "He has a car."
    );
    expect(
      say({ subject: "he", verb: "have:i", object: "a car", mode: past, contract: true })
    ).toBe("He had a car.");
  });

  it("have to: not \"I've to work\"", () => {
    expect(say({ subject: "I", verb: "have:i", object: "to work", contract: true })).toBe(
      "I have to work."
    );
  });
});

describe("an auxiliary is contracted", () => {
  it("perfect have", () => {
    const opts = { verb: "buy:i", object: "a phone", perfect: true, contract: true };
    expect(say({ ...opts, subject: "I" })).toBe("I've bought a phone.");
    expect(say({ ...opts, subject: "he" })).toBe("He's bought a phone.");
    expect(say({ ...opts, subject: "they" })).toBe("They've bought a phone.");
    expect(say({ ...opts, subject: "he", mode: past })).toBe("He'd bought a phone.");
  });

  it("continuous be", () => {
    const opts = { verb: "buy:i", object: "a phone", continuous: true, contract: true };
    expect(say({ ...opts, subject: "I" })).toBe("I'm buying a phone.");
    expect(say({ ...opts, subject: "he" })).toBe("He's buying a phone.");
    expect(say({ ...opts, subject: "they" })).toBe("They're buying a phone.");
  });

  it("passive be", () => {
    expect(say({ subject: "it", verb: "buy:i", passive: true, contract: true })).toBe(
      "It's bought."
    );
  });

  it("will, would and should have", () => {
    const opts = { verb: "buy:i", object: "a phone", mode: modal, contract: true };
    expect(say({ ...opts, subject: "I", modal: ModalVerb.will })).toBe("I'll buy a phone.");
    expect(say({ ...opts, subject: "he", modal: ModalVerb.would })).toBe("He'd buy a phone.");
    expect(say({ ...opts, subject: "he", modal: ModalVerb.should, perfect: true })).toBe(
      "He should've bought a phone."
    );
  });

  it("had better", () => {
    expect(
      say({ subject: "I", verb: "go:i", mode: modal, modal: ModalVerb.had_better, contract: true })
    ).toBe("I'd better go.");
  });
});

describe("the copula contracts like an auxiliary", () => {
  it.each([
    ["I", "late", "I'm late."],
    ["he", "hungry", "He's hungry."],
    ["she", "a teacher", "She's a teacher."],
    ["it", "late", "It's late."],
    ["we", "ready", "We're ready."],
    ["you", "a teacher", "You're a teacher."],
    ["they", "happy", "They're happy."],
  ])("%s + %s", (subject, object, expected) => {
    expect(say({ subject, verb: "be:s", object, contract: true })).toBe(expected);
  });

  it("does not contract without the option", () => {
    expect(say({ subject: "he", verb: "be:s", object: "hungry" })).toBe("He is hungry.");
  });

  it("does not contract in the past, where English has no contracted form", () => {
    expect(say({ subject: "he", verb: "be:s", object: "hungry", mode: past, contract: true })).toBe(
      "He was hungry."
    );
  });
});

describe("a stranded verb is never contracted", () => {
  // "Yes, he is." not "Yes, he's." - the verb closes the clause, with the
  // rest elided, so nothing follows it to lean on.
  it("copula with no complement", () => {
    expect(say({ subject: "he", verb: "be:s", contract: true })).toBe("He is.");
    expect(say({ subject: "I", verb: "be:s", contract: true })).toBe("I am.");
    expect(say({ subject: "they", verb: "be:s", contract: true })).toBe("They are.");
  });
});

describe("\"am not\" has no contracted form", () => {
  // There is no standard "amn't". A statement contracts the subject instead,
  // and a question takes "aren't".
  const opts = { subject: "I", verb: "be:s", object: "hungry", negative: true };

  it("statement: I'm not", () => {
    expect(say({ ...opts, contract: true })).toBe("I'm not hungry.");
  });

  it("question: aren't I", () => {
    expect(say({ ...opts, contract: true, interrogative: true })).toBe("Aren't I hungry?");
  });

  it("without contractions it stays am not", () => {
    expect(say(opts)).toBe("I am not hungry.");
    expect(say({ ...opts, interrogative: true })).toBe("Am I not hungry?");
  });

  it("works when am is an auxiliary too", () => {
    expect(
      say({ subject: "I", verb: "buy:i", continuous: true, negative: true, contract: true })
    ).toBe("I'm not buying.");
  });

  it("the other persons keep their ordinary contractions", () => {
    expect(say({ ...opts, subject: "he", contract: true })).toBe("He isn't hungry.");
    expect(say({ ...opts, subject: "they", contract: true })).toBe("They aren't hungry.");
    expect(say({ ...opts, subject: "he", contract: true, interrogative: true })).toBe(
      "Isn't he hungry?"
    );
  });
});

describe("modal negatives", () => {
  const opts = { subject: "I", verb: "go:i", object: "home", mode: modal, negative: true };

  // only the modals with an everyday contracted negative contract
  it.each([
    [ModalVerb.can, "I can't go home.", "I cannot go home."],
    [ModalVerb.could, "I couldn't go home.", "I could not go home."],
    [ModalVerb.will, "I won't go home.", "I will not go home."],
    [ModalVerb.would, "I wouldn't go home.", "I would not go home."],
    [ModalVerb.should, "I shouldn't go home.", "I should not go home."],
    [ModalVerb.must, "I mustn't go home.", "I must not go home."],
  ])("%s contracts", (m, contracted, full) => {
    expect(say({ ...opts, modal: m, contract: true })).toBe(contracted);
    expect(say({ ...opts, modal: m })).toBe(full);
  });

  it("must not -> mustn't", () => {
    expect(say({ ...opts, modal: ModalVerb.must, contract: true })).toContain("mustn't");
  });

  // "shan't" is archaic, and "I'll not" is archaic or regional. An ESL learner
  // should get the plain full form whether or not contractions are on.
  it("shall not is never shan't", () => {
    expect(say({ ...opts, modal: ModalVerb.shall, contract: true })).toBe("I shall not go home.");
    expect(say({ ...opts, modal: ModalVerb.shall })).toBe("I shall not go home.");
    expect(say({ ...opts, subject: "we", modal: ModalVerb.shall, contract: true })).toBe(
      "We shall not go home."
    );
  });

  // "mayn't" and "mightn't" are rare enough to leave out
  it.each([
    [ModalVerb.may, "I may not go home."],
    [ModalVerb.might, "I might not go home."],
  ])("%s keeps not as a separate word", (m, expected) => {
    expect(say({ ...opts, modal: m, contract: true })).toBe(expected);
    expect(say({ ...opts, modal: m })).toBe(expected);
  });

  it("the two-word modals negate in the right place", () => {
    expect(say({ ...opts, modal: ModalVerb.ought_to, contract: true })).toBe(
      "I ought not to go home."
    );
    expect(say({ ...opts, modal: ModalVerb.had_better })).toBe("I had better not go home.");
    expect(say({ ...opts, modal: ModalVerb.had_better, contract: true })).toBe(
      "I'd better not go home."
    );
  });

  it("an affirmative shall still contracts", () => {
    expect(
      say({ subject: "I", verb: "go:i", mode: modal, modal: ModalVerb.shall, contract: true })
    ).toBe("I'll go.");
  });
});

describe("cannot", () => {
  it("is one word even with contractions off", () => {
    expect(
      say({ subject: "I", verb: "go:i", mode: modal, modal: ModalVerb.can, negative: true })
    ).toBe("I cannot go.");
  });
});

describe("the pronoun I", () => {
  it("is capitalized wherever it stands", () => {
    expect(say({ subject: "I", verb: "buy:i", perfect: true, continuous: true })).toBe(
      "I have been buying."
    );
    expect(
      say({ subject: "I", verb: "buy:i", perfect: true, continuous: true, interrogative: true })
    ).toBe("Have I been buying?");
  });

  it("is capitalized in its contracted forms", () => {
    expect(say({ subject: "I", verb: "buy:i", perfect: true, contract: true })).toBe(
      "I've bought."
    );
    expect(say({ subject: "I", verb: "be:s", object: "late", contract: true })).toBe("I'm late.");
    expect(say({ subject: "I", verb: "go:i", mode: modal, modal: ModalVerb.will, contract: true })).toBe(
      "I'll go."
    );
  });
});

// A broad sweep: the invariants above should hold in every combination, not
// only in the hand-picked ones.
describe("no combination produces a form English forbids", () => {
  const subjects = ["I", "we", "you", "he", "she", "it", "they"];
  const verbs = ["be:s", "have:i", "go:i", "buy:i", "ask:r", "do:i"];
  const modes = [
    { mode: SentenceMode.PresentTense },
    { mode: past },
    ...Object.values(ModalVerb).map((m) => ({ mode: modal, modal: m })),
  ];
  const flag = [false, true];

  const sentences: string[] = [];
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
                      say({
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

  const matching = (re: RegExp) => [...new Set(sentences.filter((s) => re.test(s)))].slice(0, 3);

  it("generated something", () => {
    expect(sentences.length).toBeGreaterThan(10000);
  });

  it("no archaic or invented negative", () => {
    expect(matching(/\b(amn't|mayn't|shan't|mightn't|oughtn't)/i)).toEqual([]);
  });

  it("no leftover underscore from a two-word modal", () => {
    expect(matching(/_/)).toEqual([]);
  });

  it("no lowercase pronoun i", () => {
    expect(matching(/(^|\s)i(\s|$)/)).toEqual([]);
  });

  it("no doubled negation", () => {
    expect(matching(/n't\s+not\b|\bnot\s+n't/i)).toEqual([]);
  });

  it("no double space", () => {
    expect(matching(/ {2}/)).toEqual([]);
  });

  it("never ends in a contracted pronoun (a stranded verb)", () => {
    expect(matching(/\b(I|he|she|it|we|you|they)'(s|re|m|ve|d|ll)[.?]$/)).toEqual([]);
  });

  it("never contracts main-verb have", () => {
    const withObject = subjects.flatMap((subject) =>
      [past, SentenceMode.PresentTense].map((mode) =>
        say({ subject, verb: "have:i", mode, object: "a car", contract: true })
      )
    );
    expect(withObject.filter((s) => /'(ve|s|d) a car/.test(s))).toEqual([]);
  });
});
