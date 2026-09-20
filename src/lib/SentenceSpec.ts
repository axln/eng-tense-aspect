import { BeVerb } from "~/lib/BeVerb";
import { IrregularVerb } from "~/lib/IrregularVerb";
import { Modal, ModalVerb } from "~/lib/Modal";
import { Pronoun, pronounList } from "~/lib/Pronoun";
import { SentenceMode, type SentenceParams } from "~/lib/Sentence";
import type { VerbObjects } from "~/type";
import { Verb } from "~/lib/Verb";
import { irregularVerbList } from "~/spelling/IrregularVerbList";
import { objectList } from "~/spelling/ObjectList";
import { verbList } from "~/spelling/VerbList";

// A flat, serializable description of a sentence: what the UI controls hold.
// `SentenceParams` objects are built from it on demand, because buildSentence
// mutates the verbs it is given (it sets their form).
export type SentenceSpec = {
  pronounKey: string;
  verbKey: string;
  mode: SentenceMode;
  modalVerb: ModalVerb;
  passive: boolean;
  continuous: boolean;
  perfect: boolean;
  negative: boolean;
  interrogative: boolean;
  contract: boolean;
  objectIndex: number; // NO_OBJECT, or an index into the verb's object list
};

export const NO_OBJECT = -1;

export type Option = {
  key: string;
  label: string;
};

// `lie` is in both verb lists (tell untruth / recline), so the base form alone
// is not a unique key: the suffix says which list (and class) it comes from.
// r = regular, i = irregular, s = special (be, which is in neither list).
export const verbOptions: Option[] = [
  ...Object.keys(verbList).map((base) => ({ key: `${base}:r`, label: base })),
  ...Object.keys(irregularVerbList).map((base) => ({
    key: `${base}:i`,
    label: `${base} (irr)`,
  })),
  { key: "be:s", label: "be (special)" },
].sort((a, b) => a.label.localeCompare(b.label));

export const pronounOptions: Option[] = Object.keys(pronounList).map((key) => ({
  key,
  label: key.replace("_", " "),
}));

export const modalOptions: Option[] = Object.values(ModalVerb).map((key) => ({
  key,
  label: key.replace("_", " "),
}));

export const modeOptions: Option[] = [
  { key: SentenceMode.PresentTense, label: "present tense" },
  { key: SentenceMode.PastTense, label: "past tense" },
  { key: SentenceMode.ModalVerb, label: "modal verb" },
];

export function createVerb(verbKey: string): Verb {
  const [base, listType] = verbKey.split(":");

  switch (listType) {
    case "s":
      return new BeVerb(base);
    case "i":
      return new IrregularVerb(base);
    default:
      return new Verb(base);
  }
}

// Objects are keyed by verb base form. The full key is tried first, so a base
// form that means two different things in the two verb lists (`lie`) can give
// each sense its own objects.
function objectEntry(verbKey: string): VerbObjects | undefined {
  return objectList[verbKey] ?? objectList[verbKey.split(":")[0]];
}

// The passive voice takes its own phrasing, and a verb with no entry for the
// voice simply has nothing to offer.
export function objectsFor(verbKey: string, passive: boolean): string[] {
  const entry = objectEntry(verbKey);

  if (!entry) {
    return [];
  }

  return (passive ? entry.passive : entry.active) ?? [];
}

// Transitive verbs are left without a "no object" choice, since "I bring."
// is not a sentence anyone would want to build. In the passive the object has
// become the subject, so nothing is required there.
export function objectRequired(verbKey: string, passive: boolean): boolean {
  if (passive) {
    return false;
  }

  return Boolean(objectEntry(verbKey)?.required) && objectsFor(verbKey, false).length > 0;
}

export function defaultObjectIndex(verbKey: string, passive: boolean): number {
  return objectRequired(verbKey, passive) ? 0 : NO_OBJECT;
}

export function specToParams(spec: SentenceSpec): SentenceParams {
  const objects = objectsFor(spec.verbKey, spec.passive);

  return {
    object: objects[spec.objectIndex],
    mode: spec.mode,
    subject: new Pronoun(spec.pronounKey),
    modalVerb: new Modal(spec.modalVerb),
    verb: createVerb(spec.verbKey),
    verbMode: {
      passive: spec.passive,
      continuous: spec.continuous,
      perfect: spec.perfect,
    },
    negative: spec.negative,
    interrogative: spec.interrogative,
    contract: spec.contract,
  };
}

// No aspect checkbox ticked means the simple (indefinite) aspect.
export function describeSpec(spec: SentenceSpec): string {
  const parts: string[] = [];

  if (spec.mode === SentenceMode.ModalVerb) {
    parts.push(spec.modalVerb.replace("_", " "));
  } else {
    parts.push(spec.mode === SentenceMode.PastTense ? "past" : "present");
  }

  if (spec.perfect) {
    parts.push("perfect");
  }

  if (spec.continuous) {
    parts.push("continuous");
  }

  if (!spec.perfect && !spec.continuous) {
    parts.push("simple (indefinite)");
  }

  parts.push(spec.passive ? "passive" : "active");

  return parts.join(" ");
}
