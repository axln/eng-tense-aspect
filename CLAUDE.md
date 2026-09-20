# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Svelte 5 + Vite + TypeScript app that generates English sentences for every tense/aspect/voice combination and renders each word labelled with its grammatical role. Yarn is the package manager (`yarn.lock`). There is no test runner or linter configured.

## Commands

- `yarn dev` — Vite dev server
- `yarn build` / `yarn preview` — production build / serve it
- `yarn run check` — `svelte-check --tsconfig ./tsconfig.app.json` then `tsc -p tsconfig.node.json`

Always run type checks through `yarn run check` (or pass `--tsconfig ./tsconfig.app.json`). A bare `npx svelte-check` picks up the root `tsconfig.json`, which has `files: []`, so it checks nothing and reports 0 errors.

## The `~` alias

`~` maps to `src/` and is used for all internal imports (`~/lib/Verb`, `~/type`). It has to be declared in two places that don't share config:
- `vite.config.ts` → `resolve.alias` (bundling)
- `tsconfig.app.json` → `compilerOptions.paths` (type checking / editor). The root `tsconfig.json` is a solution-style file with `references`, and its `compilerOptions` are not inherited by the referenced projects, so `paths` placed there has no effect.

## Architecture

The core is a pure sentence-building pipeline in `src/lib/`; `src/App.svelte` only constructs a hard-coded `SentenceParams` object (there are no UI controls yet, so edit it to try other combinations), calls `buildSentence`, and renders the resulting `Word[]` with each word's `WordRole` as a label.

`buildSentence` (`src/lib/Sentence.ts`) is the entry point. It turns `SentenceParams` (mode, subject `Pronoun`, `verb`, `verbMode` flags for passive/continuous/perfect, negative, interrogative, contract, optional `Modal`) into a `Word[]` (`{ text, role, form? }`, defined in `src/type.ts`) in these steps:

1. **Verb chain** — `buildVerbChain` wraps the main verb by *prepending* auxiliaries in a fixed order: passive (`be` + v3), then continuous (`be` + ing), then perfect (`have` + v3). It also sets `form` on the head of the chain at each step, so the order of these blocks matters.
2. **Finite verb** — for `ModalVerb` mode the `Modal` is prepended. Otherwise `do` is prepended if the sentence is negative/interrogative and the first verb isn't `be`/`have` (do-support), and `makePersonal(subject, isPresent)` sets the head verb to present or past agreeing with the subject.
3. **Negation** — flags `negative`/`contract` are set on the *first* verb in the chain only; the verb's `renderToWords` emits either `not` or an `n't` suffix.
4. **Render + subject placement** — each verb renders to `Word[]`; the subject goes first, or after the first word for interrogative inversion.
5. **Contractions** — `applyContractions` (`src/lib/Helper.ts`) rewrites adjacent word pairs from the rule table in `src/spelling/Contractions.ts` (only when `contract`), and `can not` → `cannot` always applies. Contractions are skipped when the second word has `role === "verb"`, so semantic verbs are never contracted. Finally, the end punctuation is appended and the first word capitalised.

### Text convention

All word text is kept **lowercase** throughout the pipeline; only the first word of the finished sentence is capitalised (`capitalize` at the end of `buildSentence`). Contraction rules are matched by exact, case-sensitive string comparison of `"<word1> <word2>"`, so the `from` side of every rule must be lowercase and any word that isn't lowercase in the pipeline will never match (see Known state for the `I` consequence). The `to` side may contain capitals (`"I'm"`).

### Verb class hierarchy

`BaseVerb` → `Verb` → `IrregularVerb` / `BeVerb`. `Modal` also extends `BaseVerb`, not `Verb`.

- `Verb` holds `form` (`VerbForm`: base/present/past/ing/v3), `subject`, and `role` (`WordRole`, used for labelling and by the contraction logic). It looks up irregular spellings through the overridable `getSpellingInfo`.
- `IrregularVerb` differs only by reading from `spelling/IrregularVerbList.ts` instead of `spelling/VerbList.ts`.
- `BeVerb` overrides `getVerbForm` entirely (am/is/are/was/were), since `be` is not in either list.
- `Modal` takes a `ModalVerb` enum value as its base. Multi-word modals use underscores (`ought_to`, `had_better`) and are split into separate `Word`s on render. It builds its own negation: `contractNegative` handles `can't`/`won't`/`shan't` and otherwise appends `n't`; the uncontracted `not` goes after the first word, except after `had better`.

`Pronoun` is constructed by key into `pronounList` (`src/lib/Pronoun.ts`): `I`, `we`, `you_singular`, `you` (plural), `he`, `she`, `it`, `they`. Note the plural/singular naming asymmetry for `you`. Each entry has person, number, optional gender and a `spelling` per `GrammarCase`; only `subject` is used so far. Verb agreement goes through `isThirdSingular()` / `isSingular()` / `isPlural()`.

### Spelling data

`src/spelling/VerbList.ts` (regular verbs) and `IrregularVerbList.ts` are lookup tables keyed by base form. An empty `{}` entry means all forms are built by appending `-s`/`-ed`/`-ing`; only exceptions are listed (`thirdSingular`, `ing`, `ed`, `past`, `v3`). **A verb missing from the relevant list makes `getSpellingInfo` return `undefined`, which crashes in `getVerbForm`.** Add new verbs to the list, using `IrregularVerb` for entries in `IrregularVerbList.ts`. `have` and `do` used as auxiliaries are `IrregularVerb`s too.

## Known state

- `yarn run check` reports 5 `Object is possibly 'undefined'` errors (`Verb.ts:41`, `BeVerb.ts:17,20,21,29`), all from `this.subject` being optional in `Verb`. They don't affect `yarn dev`/`yarn build`.
- `pronounList.I` has `subject: "I"` (capital), which breaks the lowercase convention, so the `i am`/`i have`/... contraction rules never match and `I am going` is not contracted. Fixing it means spelling it `"i"` and uppercasing a standalone `i` as a final step.
- `BeVerb` + `I` + negative + contract renders `amn't` (should be `I'm not`, or `aren't I` in questions). This can't be fixed in the contraction table, which only merges two words into one.
- `Modal` negative contraction is wrong for `ought_to` (`ought_ton't to`) and `had_better`; `may` gives the archaic `mayn't`.
- The `should not` → `shouldn't` contraction rule is dead: negative modals are already rendered as `shouldn't` before contractions run.
