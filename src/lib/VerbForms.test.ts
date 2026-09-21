import { describe, expect, it } from "vitest";
import { ModalVerb } from "~/lib/Modal";
import { SentenceMode } from "~/lib/Sentence";
import { verbOptions } from "~/lib/SentenceSpec";
import { say } from "~/lib/testHelper";
import { verbForms } from "~/lib/VerbForms";

describe("verbForms", () => {
  it.each([
    ["ask:r", { base: "ask", present: "ask / asks", past: "asked", presentParticiple: "asking", pastParticiple: "asked" }],
    ["go:i", { base: "go", present: "go / goes", past: "went", presentParticiple: "going", pastParticiple: "gone" }],
    ["have:i", { base: "have", present: "have / has", past: "had", presentParticiple: "having", pastParticiple: "had" }],
    ["catch:i", { base: "catch", present: "catch / catches", past: "caught", presentParticiple: "catching", pastParticiple: "caught" }],
    ["be:s", { base: "be", present: "am / is / are", past: "was / were", presentParticiple: "being", pastParticiple: "been" }],
  ])("charts the forms of %s", (key, expected) => {
    expect(verbForms(key)).toEqual(expected);
  });

  it("fills every place of the chart, for every verb", () => {
    for (const { key } of verbOptions) {
      for (const [place, text] of Object.entries(verbForms(key))) {
        expect(text.length, `${key} ${place}`).toBeGreaterThan(0);
      }
    }
  });

  // The chart is worth nothing if it disagrees with the sentences, so check
  // every verb against the pipeline instead of against a second copy of the
  // spelling rules.
  it("matches the forms that the sentences use, for every verb", () => {
    for (const { key } of verbOptions) {
      const { base, present, past, presentParticiple, pastParticiple } = verbForms(key);

      // one spelling per person that differs: "am / is / are" is I, he, you
      const [presentI, presentHe, presentYou] = present.split(" / ");
      const [pastI, pastYou] = past.split(" / ");

      expect(say({ subject: "I", verb: key }), key).toBe(`I ${presentI}.`);
      expect(say({ subject: "he", verb: key }), key).toBe(`He ${presentHe}.`);
      expect(say({ subject: "you", verb: key }), key).toBe(`You ${presentYou ?? presentI}.`);

      expect(say({ subject: "I", verb: key, mode: SentenceMode.PastTense }), key).toBe(`I ${pastI}.`);
      expect(say({ subject: "you", verb: key, mode: SentenceMode.PastTense }), key).toBe(`You ${pastYou ?? pastI}.`);

      // "He has gone.", "He is going."
      expect(say({ verb: key, perfect: true }), key).toBe(`He has ${pastParticiple}.`);
      expect(say({ verb: key, continuous: true }), key).toBe(`He is ${presentParticiple}.`);

      // the base form follows a modal: "He can go."
      expect(say({ verb: key, mode: SentenceMode.ModalVerb, modal: ModalVerb.can }), key).toBe(`He can ${base}.`);
    }
  });
});
