# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git

**Do not commit or push until the user explicitly asks.** Make the changes, verify them, and stop; leave them uncommitted in the working tree. A request to make a change is not a request to commit it, and an earlier "commit and push" does not carry over to later changes.

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

The core is a pure sentence-building pipeline in `src/lib/`, kept free of UI concerns. The UI lives in `src/App.svelte` (controls) and `src/component/` (`Sentence.svelte`, `Word.svelte`), and is written with Svelte 5 runes (`$state`, `$derived`, `$props`).

`src/lib/SentenceSpec.ts` is the bridge between them. It holds `SentenceSpec`, a flat record of exactly what the controls bind to, plus the dropdown option lists and `specToParams`, which turns a spec into a fresh `SentenceParams`. Build the params fresh on every render: `buildSentence` mutates the verbs it is handed (it sets their `form`), so a reused `Verb` instance produces wrong output the second time.

Verb keys carry a list suffix (`ask:r`, `go:i`, `be:s`) because `lie` exists in both spelling lists, so the base form alone is not unique. `createVerb` maps the suffix to `Verb` / `IrregularVerb` / `BeVerb`.

Objects come from `src/spelling/ObjectList.ts`, which covers every verb in both spelling lists (3-5 `active` phrases each). `active` and `passive` are separate phrasings because the active object normally becomes the subject in the passive, leaving an agent or adverbial behind; an empty `passive` list means the verb has no natural passive. Lookup is by full verb key first, then verb base form, so `lie:r` (tell an untruth) and `lie:i` (recline) get different objects while every other verb is keyed by base form alone.

`required: true` marks a transitive verb that sounds unfinished bare (`I bring.`). For those the UI drops the "no object" choice and defaults to the first phrase. It applies to the **active voice only** — in the passive the object has become the subject, so `It is brought.` is complete and the choice is optional again. In the spec the choice is an index, with `NO_OBJECT` (-1) meaning none; `App.svelte` resets it via `defaultObjectIndex` whenever the verb or the voice changes, since an index only means something for one verb in one voice.

The three aspect checkboxes (perfect, continuous, passive) map straight onto `verbMode` and combine freely; none ticked means the simple (indefinite) aspect. All three at once is intentionally allowed — English permits it (`has been being asked`) even though it is vanishingly rare, so the UI labels it "rarely used together" rather than preventing it.

`buildSentence` (`src/lib/Sentence.ts`) is the entry point. It turns `SentenceParams` (mode, subject `Pronoun`, `verb`, `verbMode` flags for passive/continuous/perfect, negative, interrogative, contract, optional `Modal`) into a `Word[]` (`{ text, role, form? }`, defined in `src/type.ts`) in these steps:

1. **Verb chain** — `buildVerbChain` wraps the main verb by *prepending* auxiliaries in a fixed order: passive (`be` + v3), then continuous (`be` + ing), then perfect (`have` + v3). It also sets `form` on the head of the chain at each step, so the order of these blocks matters.
2. **Finite verb** — for `ModalVerb` mode the `Modal` is prepended. Otherwise `do` is prepended if the sentence is negative/interrogative and the first verb isn't `be`/`have` (do-support), and `makePersonal(subject, isPresent)` sets the head verb to present or past agreeing with the subject.
3. **Negation** — flags `negative`/`contract` are set on the *first* verb in the chain only; the verb's `renderToWords` emits either `not` or an `n't` suffix.
4. **Render, subject and object placement** — each verb renders to `Word[]`; the subject goes first, or after the first word for interrogative inversion; the optional `object` string is appended after the whole verb chain as a single `WordRole.object` word (a phrase like `a new phone` is one tile, not split).
5. **Contractions** — `applyContractions` (`src/lib/Helper.ts`) rewrites adjacent word pairs from the rule table in `src/spelling/Contractions.ts` (only when `contract`), and `can not` → `cannot` always applies. Finally, the end punctuation is appended and the first word capitalised.

`contractible` in `Helper.ts` encodes where English blocks a subject+verb contraction: when the verb is **stranded** at the end of the clause with the rest elided (`Yes, he is.`, never `Yes, he's.`), and when it is a **semantic verb** rather than an auxiliary (`I have a car`, not `I've a car`). The copula is the exception to the second rule — it carries `WordRole.verb` because it is the only verb in the chain, but `He's hungry.` is ordinary English, so `beForms` lets it contract. Stranding is detected by position: the end punctuation has not been appended yet, so the last element of the array is the last word of the clause.

`am not` is the gap in the negation paradigm — there is no standard `amn't` — and it is the only negation whose form depends on the sentence type, so `BeVerb` overrides `renderToWords`: a question takes suppletive `aren't I`, a statement emits an uncontracted `am` + `not` and lets the subject contract instead, giving `I'm not`. `BaseVerb.interrogative` exists solely to carry that distinction down from `buildSentence`.

### Text convention

All word text is kept **lowercase** throughout the pipeline; only the first word of the finished sentence is capitalised (`capitalize` at the end of `buildSentence`). Contraction rules are matched by exact, case-sensitive string comparison of `"<word1> <word2>"`, so **both sides of every rule must be lowercase**; a word that isn't lowercase in the pipeline will silently never match. The pronoun `i` is stored lowercase for this reason (`pronounList.I.spelling.subject`), and `capitalizePronounI` restores it — and its contracted forms `i'm`/`i've`/`i'd`/`i'll` — near the end of `buildSentence`, after contractions and before the first word is capitalised.

### Verb class hierarchy

`BaseVerb` → `Verb` → `IrregularVerb` / `BeVerb`. `Modal` also extends `BaseVerb`, not `Verb`.

- `Verb` holds `form` (`VerbForm`: base/present/past/ing/v3), `subject`, and `role` (`WordRole`, used for labelling and by the contraction logic). It looks up irregular spellings through the overridable `getSpellingInfo`.
- `IrregularVerb` differs only by reading from `spelling/IrregularVerbList.ts` instead of `spelling/VerbList.ts`.
- `BeVerb` overrides `getVerbForm` entirely (am/is/are/was/were), since `be` is not in either list.
- `Modal` takes a `ModalVerb` enum value as its base. Multi-word modals use underscores (`ought_to`, `had_better`) and are split into separate `Word`s on render. It builds its own negation from the `negativeContractions` allow-list — `can't`, `couldn't`, `won't`, `wouldn't`, `shouldn't`, `mustn't`. Every other modal keeps `not` as a separate word (`may not`, `shall not`, `ought not to`, `had better not`), which is placed after the first word except for `had better`, where it goes last. **Do not fall back to appending `n't`**: that is what produced the archaic `mayn't`/`shan't` and the nonsense `ought_ton't`.

`Pronoun` is constructed by key into `pronounList` (`src/lib/Pronoun.ts`): `I`, `we`, `you`, `he`, `she`, `it`, `they`. `you` is typed as plural; a `you_singular` entry exists but is commented out. Each entry has person, number, optional gender and a `spelling` per `GrammarCase`; only `subject` is used so far. Verb agreement goes through `isThirdSingular()` / `isSingular()` / `isPlural()`.

### Spelling data

`src/spelling/VerbList.ts` (regular verbs) and `IrregularVerbList.ts` are lookup tables keyed by base form. An empty `{}` entry means all forms are built by appending `-s`/`-ed`/`-ing`; only exceptions are listed (`thirdSingular`, `ing`, `ed`, `past`, `v3`). **A verb missing from the relevant list makes `getSpellingInfo` return `undefined`, which crashes in `getVerbForm`.** Add new verbs to the list, using `IrregularVerb` for entries in `IrregularVerbList.ts`. `have` and `do` used as auxiliaries are `IrregularVerb`s too.

## Known state

The audience is ESL learners, so the output must stay within everyday modern English: no archaic forms (`amn't`, `mayn't`, `shan't`), and no form a learner would be marked wrong for using. Where English has a gap or an awkward form, the app should produce what a teacher would actually teach.

- `yarn run check` reports 5 `Object is possibly 'undefined'` errors (`Verb.ts:41`, `BeVerb.ts:17,20,21,29`), all from `this.subject` being optional in `Verb`. They don't affect `yarn dev`/`yarn build`.
- The `should not` → `shouldn't` contraction rule is dead: negative modals are already rendered as `shouldn't` before contractions run.
