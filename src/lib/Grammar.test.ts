import { describe, expect, it } from "vitest";
import { ModalVerb } from "~/lib/Modal";
import { SentenceMode } from "~/lib/Sentence";
import { say } from "~/lib/testHelper";

const past = SentenceMode.PastTense;
const modal = SentenceMode.ModalVerb;

describe("do-support", () => {
  const opts = { verb: "buy:i", object: "a phone" };

  it("is added to negatives and questions of an ordinary verb", () => {
    expect(say({ ...opts, negative: true })).toBe("He does not buy a phone.");
    expect(say({ ...opts, interrogative: true })).toBe("Does he buy a phone?");
    expect(say({ ...opts, mode: past, negative: true })).toBe("He did not buy a phone.");
    expect(say({ ...opts, mode: past, interrogative: true })).toBe("Did he buy a phone?");
  });

  it("carries the agreement, so the main verb goes back to the base form", () => {
    expect(say({ ...opts, subject: "she", negative: true, contract: true })).toBe(
      "She doesn't buy a phone."
    );
    expect(say({ ...opts, subject: "they", negative: true, contract: true })).toBe(
      "They don't buy a phone."
    );
    expect(say({ ...opts, subject: "he", verb: "go:i", object: "home", interrogative: true })).toBe(
      "Does he go home?"
    );
  });

  it("is added for main-verb have: \"I don't have\", not \"I haven't\"", () => {
    const have = { verb: "have:i", object: "a car" };
    expect(say({ ...have, subject: "I", negative: true })).toBe("I do not have a car.");
    expect(say({ ...have, subject: "I", negative: true, contract: true })).toBe(
      "I don't have a car."
    );
    expect(say({ ...have, subject: "you", interrogative: true })).toBe("Do you have a car?");
    expect(say({ ...have, subject: "he", interrogative: true })).toBe("Does he have a car?");
    expect(say({ ...have, subject: "she", mode: past, interrogative: true })).toBe(
      "Did she have a car?"
    );
    expect(say({ ...have, subject: "she", mode: past, negative: true, contract: true })).toBe(
      "She didn't have a car."
    );
  });

  it("is added for have to: \"I don't have to work\"", () => {
    expect(
      say({ subject: "I", verb: "have:i", object: "to work", negative: true, contract: true })
    ).toBe("I don't have to work.");
  });

  it("is not added when have is an auxiliary", () => {
    const opts = { verb: "buy:i", object: "a phone", perfect: true };
    expect(say({ ...opts, subject: "I", negative: true, contract: true })).toBe(
      "I haven't bought a phone."
    );
    expect(say({ ...opts, subject: "you", interrogative: true })).toBe("Have you bought a phone?");
  });

  it("is not added to be", () => {
    const opts = { verb: "be:s", object: "hungry" };
    expect(say({ ...opts, negative: true, contract: true })).toBe("He isn't hungry.");
    expect(say({ ...opts, interrogative: true })).toBe("Is he hungry?");
    expect(say({ ...opts, mode: past, negative: true, contract: true })).toBe("He wasn't hungry.");
    expect(say({ ...opts, subject: "they", mode: past, interrogative: true })).toBe(
      "Were they hungry?"
    );
  });

  it("is not added after a modal", () => {
    const opts = { verb: "go:i", object: "home", mode: modal, modal: ModalVerb.can };
    expect(say({ ...opts, negative: true, contract: true })).toBe("He can't go home.");
    expect(say({ ...opts, interrogative: true })).toBe("Can he go home?");
  });

  it("works when the main verb is do", () => {
    expect(say({ subject: "I", verb: "do:i", object: "my job", negative: true, contract: true })).toBe(
      "I don't do my job."
    );
    expect(say({ subject: "you", verb: "do:i", object: "my job", interrogative: true })).toBe(
      "Do you do my job?"
    );
  });
});

describe("agreement", () => {
  it("adds -s only for the third person singular", () => {
    expect(say({ subject: "I", verb: "buy:i" })).toBe("I buy.");
    expect(say({ subject: "you", verb: "buy:i" })).toBe("You buy.");
    expect(say({ subject: "we", verb: "buy:i" })).toBe("We buy.");
    expect(say({ subject: "they", verb: "buy:i" })).toBe("They buy.");
    expect(say({ subject: "he", verb: "buy:i" })).toBe("He buys.");
    expect(say({ subject: "she", verb: "buy:i" })).toBe("She buys.");
    expect(say({ subject: "it", verb: "buy:i" })).toBe("It buys.");
  });

  it("puts the agreement on the first verb of the chain only", () => {
    expect(say({ subject: "he", verb: "buy:i", perfect: true })).toBe("He has bought.");
    expect(say({ subject: "he", verb: "buy:i", perfect: true, continuous: true })).toBe(
      "He has been buying."
    );
    expect(say({ subject: "he", verb: "buy:i", continuous: true })).toBe("He is buying.");
  });

  it("be agrees in every person and tense", () => {
    const be = { verb: "be:s", object: "late" };
    expect(say({ ...be, subject: "I" })).toBe("I am late.");
    expect(say({ ...be, subject: "you" })).toBe("You are late.");
    expect(say({ ...be, subject: "he" })).toBe("He is late.");
    expect(say({ ...be, subject: "we" })).toBe("We are late.");
    expect(say({ ...be, subject: "they" })).toBe("They are late.");
    expect(say({ ...be, subject: "I", mode: past })).toBe("I was late.");
    expect(say({ ...be, subject: "he", mode: past })).toBe("He was late.");
    expect(say({ ...be, subject: "you", mode: past })).toBe("You were late.");
    expect(say({ ...be, subject: "they", mode: past })).toBe("They were late.");
  });

  it("have is has for the third person singular", () => {
    expect(say({ subject: "he", verb: "have:i", object: "a car" })).toBe("He has a car.");
    expect(say({ subject: "I", verb: "have:i", object: "a car" })).toBe("I have a car.");
  });
});

describe("the three aspects", () => {
  const opts = { verb: "buy:i", object: "a phone" };

  it("none ticked is the simple aspect", () => {
    expect(say({ ...opts })).toBe("He buys a phone.");
    expect(say({ ...opts, mode: past })).toBe("He bought a phone.");
  });

  it("perfect, continuous and passive combine in pairs", () => {
    expect(say({ ...opts, perfect: true })).toBe("He has bought a phone.");
    expect(say({ ...opts, continuous: true })).toBe("He is buying a phone.");
    expect(say({ ...opts, passive: true, object: undefined, subject: "it" })).toBe("It is bought.");
    expect(say({ ...opts, perfect: true, continuous: true })).toBe("He has been buying a phone.");
    expect(say({ ...opts, perfect: true, passive: true, object: undefined, subject: "it" })).toBe(
      "It has been bought."
    );
    expect(say({ ...opts, continuous: true, passive: true, object: undefined, subject: "it" })).toBe(
      "It is being bought."
    );
  });

  // rare, but English does permit it
  it("all three together", () => {
    expect(
      say({ verb: "buy:i", subject: "it", perfect: true, continuous: true, passive: true })
    ).toBe("It has been being bought.");
  });

  it("modals take the aspects too", () => {
    const m = { ...opts, mode: modal, modal: ModalVerb.will };
    expect(say(m)).toBe("He will buy a phone.");
    expect(say({ ...m, perfect: true })).toBe("He will have bought a phone.");
    expect(say({ ...m, continuous: true })).toBe("He will be buying a phone.");
    expect(say({ ...m, perfect: true, continuous: true })).toBe(
      "He will have been buying a phone."
    );
  });
});

describe("questions", () => {
  it("invert the subject with the first verb", () => {
    expect(say({ subject: "you", verb: "buy:i", perfect: true, interrogative: true })).toBe(
      "Have you bought?"
    );
    expect(say({ subject: "it", verb: "buy:i", continuous: true, passive: true, interrogative: true })).toBe(
      "Is it being bought?"
    );
    expect(say({ subject: "she", verb: "go:i", mode: modal, modal: ModalVerb.should, interrogative: true })).toBe(
      "Should she go?"
    );
  });

  it("end in a question mark, and statements in a full stop", () => {
    expect(say({ verb: "go:i", interrogative: true })).toMatch(/\?$/);
    expect(say({ verb: "go:i" })).toMatch(/\.$/);
  });

  it("always start with a capital", () => {
    expect(say({ verb: "go:i", interrogative: true })).toMatch(/^[A-Z]/);
    expect(say({ subject: "we", verb: "go:i" })).toMatch(/^[A-Z]/);
  });
});

describe("the object", () => {
  it("closes the sentence, after the whole verb chain", () => {
    expect(
      say({ subject: "I", verb: "buy:i", object: "a new phone", perfect: true, continuous: true })
    ).toBe("I have been buying a new phone.");
  });

  it("stays last in a question and a negative", () => {
    expect(say({ verb: "buy:i", object: "a phone", interrogative: true })).toBe(
      "Does he buy a phone?"
    );
    expect(say({ verb: "buy:i", object: "a phone", negative: true })).toBe(
      "He does not buy a phone."
    );
  });
});
