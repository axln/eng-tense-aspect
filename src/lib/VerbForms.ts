import { BeVerb } from "~/lib/BeVerb";
import { IrregularVerb } from "~/lib/IrregularVerb";
import { Pronoun } from "~/lib/Pronoun";
import { createVerb } from "~/lib/SentenceSpec";
import { VerbForm } from "~/lib/Verb";

// One spelling of a finite form and the persons that use it: `asks` is used
// with he, she and it, which is called the third singular.
export type FormNote = {
  text: string;
  who: string[]; // pronoun keys, in reading order
  term?: string; // what grammar calls that group, when it has a name
};

// The five forms of a verb, laid out the way the "elementary chart" shows
// them: the base form in the middle, the finite forms (which carry tense and
// agreement) on one side and the participles on the other, present above and
// past below. `regular` says whether the past and the participle are the
// plain -ed form.
export type VerbForms = {
  base: string;
  presentNotes: FormNote[]; // "go" and "goes"; am, is and are for be
  pastNotes: FormNote[]; // "went"; was and were for be
  presentParticiple: string; // the -ing form
  pastParticiple: string; // v3
  regular: boolean;
};

// The order the pronouns are listed in a note.
const persons = ["I", "you", "he", "she", "it", "we", "they"];

// The order the spellings are met in, which is the order they are read:
// am / is / are needs "he" before "we" and "you", and "I" before all.
const spellingOrder = ["I", "he", "she", "it", "we", "you", "they"];

// The groups of persons that grammar has a name for. Others (I, you, we and
// they, which share the plain form) are just listed.
const groupNames: Record<string, string> = {
  "he,she,it": "third singular",
  "you,we,they": "plural",
  "I,he,she,it": "singular",
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

  // Ask every person for the form and group the persons that agree: an
  // ordinary verb gives "ask" and "asks", or just "went" for the past, while
  // be, the one verb that differs by more than the third person, gives
  // am / is / are and was / were.
  const finite = (form: VerbForm): FormNote[] => {
    const byText = new Map<string, string[]>();

    for (const subject of spellingOrder) {
      const text = spell(form, subject);
      byText.set(text, [...(byText.get(text) ?? []), subject]);
    }

    return [...byText].map(([text, subjects]) => {
      const who = persons.filter((person) => subjects.includes(person));

      return { text, who, term: groupNames[who.join(",")] };
    });
  };

  return {
    base: spell(VerbForm.base),
    presentNotes: finite(VerbForm.present),
    pastNotes: finite(VerbForm.past),
    presentParticiple: spell(VerbForm.ing),
    pastParticiple: spell(VerbForm.v3),
    regular: !(verb instanceof IrregularVerb || verb instanceof BeVerb),
  };
}
