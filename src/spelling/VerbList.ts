import type { VerbSpellingList } from "~/lib/Verb";

// empty objects mean that all the verb forms are constructed
// by simple appending suffixes: -s, -ed, -ing

export const verbList: VerbSpellingList = {
  ask: {},
  call: {},
  help: {},
  look: {},
  lie: { ed: "lied", ing: "lying" }, // tell untruth
  love: { ed: "loved", ing: "loving" },
  move: { ed: "moved", ing: "moving" },
  need: {},
  play: {},
  seem: {},
  start: {},
  talk: {},
  try: { thirdSingular: "tries", ed: "tried" },
  turn: {},
  use: { ed: "used", ing: "using" },
  walk: {},
  want: {},
  work: {},
};
