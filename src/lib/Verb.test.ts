import { describe, expect, it } from "vitest";
import { Pronoun } from "~/lib/Pronoun";
import { createVerb, verbOptions } from "~/lib/SentenceSpec";
import { VerbForm } from "~/lib/Verb";

// The third person singular is the subject that shows the -s form.
function forms(key: string) {
  const verb = createVerb(key);
  verb.subject = new Pronoun("he");

  const spell = (form: VerbForm) => {
    verb.form = form;
    return verb.getVerbForm();
  };

  return {
    present: spell(VerbForm.present),
    past: spell(VerbForm.past),
    v3: spell(VerbForm.v3),
    ing: spell(VerbForm.ing),
  };
}

describe("known spellings", () => {
  it.each([
    // -es
    ["catch:i", { present: "catches", ing: "catching" }],
    ["teach:i", { present: "teaches", ing: "teaching" }],
    ["go:i", { present: "goes", past: "went", v3: "gone", ing: "going" }],
    ["do:i", { present: "does", past: "did", v3: "done", ing: "doing" }],
    // consonant + y -> -ies
    ["fly:i", { present: "flies", past: "flew", v3: "flown", ing: "flying" }],
    ["try:r", { present: "tries", past: "tried", v3: "tried", ing: "trying" }],
    // vowel + y just takes -s
    ["say:i", { present: "says", past: "said", v3: "said", ing: "saying" }],
    ["play:r", { present: "plays", past: "played", ing: "playing" }],
    // dropping the silent e
    ["have:i", { present: "has", past: "had", v3: "had", ing: "having" }],
    ["give:i", { present: "gives", past: "gave", v3: "given", ing: "giving" }],
    ["make:i", { present: "makes", past: "made", ing: "making" }],
    ["write:i", { present: "writes", past: "wrote", v3: "written", ing: "writing" }],
    ["love:r", { present: "loves", past: "loved", ing: "loving" }],
    ["use:r", { present: "uses", past: "used", ing: "using" }],
    // doubling the final consonant
    ["get:i", { present: "gets", ing: "getting" }],
    ["begin:i", { present: "begins", past: "began", v3: "begun", ing: "beginning" }],
    ["run:i", { present: "runs", past: "ran", v3: "run", ing: "running" }],
    ["sit:i", { present: "sits", past: "sat", ing: "sitting" }],
    ["swim:i", { present: "swims", past: "swam", v3: "swum", ing: "swimming" }],
    ["forget:i", { present: "forgets", past: "forgot", v3: "forgotten", ing: "forgetting" }],
    // ie -> y
    ["lie:r", { present: "lies", past: "lied", v3: "lied", ing: "lying" }],
    // the same base form, a different verb
    ["lie:i", { present: "lies", past: "lay", v3: "lain", ing: "lying" }],
    // be
    ["be:s", { present: "is", past: "was", v3: "been", ing: "being" }],
  ])("%s", (key, expected) => {
    expect(forms(key)).toMatchObject(expected);
  });
});

// The table only lists exceptions, so a verb that needs one and does not have
// it silently comes out as "catchs" or "giveing". These check every verb
// against the spelling rules rather than a hand-picked few.
describe("every verb follows the spelling rules", () => {
  const all = verbOptions.map(({ key }) => ({
    key,
    base: key.split(":")[0],
    ...forms(key),
  }));

  // verbs that double the final consonant before -ing
  const doubling = new Set(["begin", "cut", "forget", "get", "hit", "let", "put", "run", "set", "shut", "sit", "swim", "win"]);

  it("covers the whole verb list", () => {
    expect(all.length).toBeGreaterThan(100);
  });

  it("the third person singular takes -s, -es or -ies as the spelling requires", () => {
    const wrong = all.filter(({ base, present }) => {
      if (base === "be") return present !== "is";
      if (base === "have") return present !== "has";
      if (base === "go" || base === "do") return present !== `${base}es`;
      if (/(s|x|z|ch|sh)$/.test(base)) return present !== `${base}es`;
      if (/[^aeiou]y$/.test(base)) return present !== `${base.slice(0, -1)}ies`;
      return present !== `${base}s`;
    });

    expect(wrong.map(({ key, present }) => `${key} -> ${present}`)).toEqual([]);
  });

  it("-ing never keeps a silent e: not \"giveing\" or \"haveing\"", () => {
    const wrong = all.filter(
      ({ base, ing }) => /eing$/.test(ing) && !/ee$/.test(base) && base !== "be"
    );

    expect(wrong.map(({ key, ing }) => `${key} -> ${ing}`)).toEqual([]);
  });

  it("-ing doubles the final consonant where English does", () => {
    const wrong = all.filter(
      ({ base, ing }) => doubling.has(base) && ing !== `${base}${base.slice(-1)}ing`
    );

    expect(wrong.map(({ key, ing }) => `${key} -> ${ing}`)).toEqual([]);
  });

  it("-ing does not double a consonant that English leaves single", () => {
    const wrong = all.filter(
      ({ base, ing }) => !doubling.has(base) && new RegExp(`^${base}(.)\\1ing$`).test(ing)
    );

    expect(wrong.map(({ key, ing }) => `${key} -> ${ing}`)).toEqual([]);
  });

  it("every form is a real word", () => {
    const bad = all.filter((f) =>
      [f.present, f.past, f.v3, f.ing].some((x) => !x || /undefined|_/.test(x))
    );

    expect(bad.map(({ key }) => key)).toEqual([]);
  });
});
