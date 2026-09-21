import { describe, expect, it } from "vitest";
import { ModalVerb } from "~/lib/Modal";
import { SentenceMode } from "~/lib/Sentence";
import { verbOptions } from "~/lib/SentenceSpec";
import { say } from "~/lib/testHelper";
import { verbForms } from "~/lib/VerbForms";

// The chart as plain values: each finite form as its spelling alone.
function chart(key: string) {
  const { base, presentNotes, pastNotes, presentParticiple, pastParticiple, regular } = verbForms(key);

  return {
    base,
    present: presentNotes.map((note) => note.text),
    past: pastNotes.map((note) => note.text),
    presentParticiple,
    pastParticiple,
    regular,
  };
}

describe("verbForms", () => {
  it.each([
    ["ask:r", { base: "ask", present: ["ask", "asks"], past: ["asked"], presentParticiple: "asking", pastParticiple: "asked", regular: true }],
    ["go:i", { base: "go", present: ["go", "goes"], past: ["went"], presentParticiple: "going", pastParticiple: "gone", regular: false }],
    ["have:i", { base: "have", present: ["have", "has"], past: ["had"], presentParticiple: "having", pastParticiple: "had", regular: false }],
    ["catch:i", { base: "catch", present: ["catch", "catches"], past: ["caught"], presentParticiple: "catching", pastParticiple: "caught", regular: false }],
    ["be:s", { base: "be", present: ["am", "is", "are"], past: ["was", "were"], presentParticiple: "being", pastParticiple: "been", regular: false }],
  ])("charts the forms of %s", (key, expected) => {
    expect(chart(key)).toEqual(expected);
  });

  it("fills every place of the chart, for every verb", () => {
    for (const { key } of verbOptions) {
      const { base, present, past, presentParticiple, pastParticiple } = chart(key);

      for (const [place, text] of Object.entries({ base, presentParticiple, pastParticiple })) {
        expect(text.length, `${key} ${place}`).toBeGreaterThan(0);
      }

      expect(present.length, key).toBeGreaterThan(0);
      expect(past.length, key).toBeGreaterThan(0);
    }
  });

  // What makes a verb regular: the past and the participle are the same -ed
  // form. The spelling list a verb comes from decides which it is called, so
  // a verb filed in the wrong list shows up here.
  it("calls a verb regular only when its past and participle are the same -ed form", () => {
    for (const { key } of verbOptions) {
      const { regular, past, pastParticiple } = chart(key);

      if (regular) {
        expect(past, key).toEqual([pastParticiple]);
        expect(pastParticiple, key).toMatch(/ed$/);
      }
    }
  });
});

describe("the notes on the slash forms", () => {
  it("say who takes the -s form of an ordinary verb", () => {
    const { presentNotes, pastNotes } = verbForms("ask:r");

    expect(presentNotes).toEqual([
      { text: "ask", who: ["I", "you", "we", "they"], term: undefined },
      { text: "asks", who: ["he", "she", "it"], term: "third singular" },
    ]);

    // one spelling for everybody: nothing to comment on
    expect(pastNotes).toHaveLength(1);
  });

  // be is the one verb with more than two present forms and two past forms
  it("split be into am / is / are and was / were", () => {
    const { presentNotes, pastNotes } = verbForms("be:s");

    expect(presentNotes).toEqual([
      { text: "am", who: ["I"], term: undefined },
      { text: "is", who: ["he", "she", "it"], term: "third singular" },
      { text: "are", who: ["you", "we", "they"], term: "plural" },
    ]);

    expect(pastNotes).toEqual([
      { text: "was", who: ["I", "he", "she", "it"], term: "singular" },
      { text: "were", who: ["you", "we", "they"], term: "plural" },
    ]);
  });

  it("give a verb with a slash form the same persons as the sentences do, for every verb", () => {
    const capitalised = (pronoun: string) => pronoun[0].toUpperCase() + pronoun.slice(1);

    for (const { key } of verbOptions) {
      const { presentNotes, pastNotes } = verbForms(key);

      for (const [notes, mode] of [
        [presentNotes, SentenceMode.PresentTense],
        [pastNotes, SentenceMode.PastTense],
      ] as const) {
        // every person is in exactly one note
        expect(notes.flatMap((note) => note.who).sort(), key).toEqual(
          ["I", "he", "it", "she", "they", "we", "you"].sort(),
        );

        for (const { text, who } of notes) {
          for (const pronoun of who) {
            expect(say({ subject: pronoun, verb: key, mode }), `${key} ${pronoun}`).toBe(`${capitalised(pronoun)} ${text}.`);
          }
        }
      }
    }
  });
});

// The chart is worth nothing if it disagrees with the sentences, so check
// every verb against the pipeline instead of against a second copy of the
// spelling rules.
describe("the chart against the sentences", () => {
  it("matches the participles and the base form that the sentences use, for every verb", () => {
    for (const { key } of verbOptions) {
      const { base, presentParticiple, pastParticiple } = verbForms(key);

      // "He has gone.", "He is going."
      expect(say({ verb: key, perfect: true }), key).toBe(`He has ${pastParticiple}.`);
      expect(say({ verb: key, continuous: true }), key).toBe(`He is ${presentParticiple}.`);

      // the base form follows a modal: "He can go."
      expect(say({ verb: key, mode: SentenceMode.ModalVerb, modal: ModalVerb.can }), key).toBe(`He can ${base}.`);
    }
  });
});
