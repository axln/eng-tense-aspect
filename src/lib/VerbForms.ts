import { Pronoun } from "~/lib/Pronoun";
import { createVerb } from "~/lib/SentenceSpec";
import { VerbForm } from "~/lib/Verb";

// The five forms of a verb, laid out the way the "elementary chart" shows
// them: the base form in the middle, the finite forms (which carry tense and
// agreement) on one side and the participles on the other, present above and
// past below.
export type VerbForms = {
  base: string;
  present: string; // "go / goes", "am / is / are"
  past: string; // "went", "was / were"
  presentParticiple: string; // the -ing form
  pastParticiple: string; // v3
};

// The forms, spelled by the same code that builds the sentences, so the chart
// can never disagree with what the tiles show.
export function verbForms(verbKey: string): VerbForms {
  const verb = createVerb(verbKey);

  // present and past forms agree with a subject, so the caller picks one
  const spell = (form: VerbForm, subject = "he"): string => {
    verb.form = form;
    verb.subject = new Pronoun(subject);
    return verb.getVerbForm();
  };

  // The distinct spellings across the three persons that can differ: an
  // ordinary verb gives "go / goes" (or just "went"), while be, the one verb
  // that differs by more than the third person, gives "am / is / are" and
  // "was / were".
  const finite = (form: VerbForm): string =>
    [...new Set(["I", "he", "you"].map((subject) => spell(form, subject)))].join(" / ");

  return {
    base: spell(VerbForm.base),
    present: finite(VerbForm.present),
    past: finite(VerbForm.past),
    presentParticiple: spell(VerbForm.ing),
    pastParticiple: spell(VerbForm.v3),
  };
}
