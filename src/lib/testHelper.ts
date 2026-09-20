import type { ModalVerb } from "~/lib/Modal";
import { Modal } from "~/lib/Modal";
import { Pronoun } from "~/lib/Pronoun";
import { buildSentence, SentenceMode } from "~/lib/Sentence";
import { createVerb } from "~/lib/SentenceSpec";

// Every field is optional so a test only spells out what it is about. The
// defaults give the plainest sentence: "He goes."
export type SayOptions = {
  subject?: string; // key into pronounList: "I", "he", "they"...
  verb?: string; // verb key with its list suffix: "go:i", "ask:r", "be:s"
  mode?: SentenceMode;
  modal?: ModalVerb;
  object?: string;
  passive?: boolean;
  continuous?: boolean;
  perfect?: boolean;
  negative?: boolean;
  interrogative?: boolean;
  contract?: boolean;
};

// Builds a fresh sentence as text. buildSentence mutates the verbs it is
// handed, so nothing here is shared between calls.
export function say(options: SayOptions = {}): string {
  const {
    subject = "he",
    verb = "go:i",
    mode = SentenceMode.PresentTense,
    modal,
    object,
    passive = false,
    continuous = false,
    perfect = false,
    negative = false,
    interrogative = false,
    contract = false,
  } = options;

  const words = buildSentence({
    mode,
    subject: new Pronoun(subject),
    modalVerb: modal ? new Modal(modal) : undefined,
    verb: createVerb(verb),
    verbMode: { passive, continuous, perfect },
    negative,
    interrogative,
    contract,
    object,
  });

  // "he goes ." -> "he goes."
  return words.map((word) => word.text).join(" ").replace(/ ([.?])$/, "$1");
}
