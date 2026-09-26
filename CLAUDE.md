# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git

**Do not commit or push until the user explicitly asks.** Make the changes, verify them, and stop; leave them uncommitted in the working tree. A request to make a change is not a request to commit it, and an earlier "commit and push" does not carry over to later changes.

**The deploy workflow pushes to `main` too** (see *Deployment*): after every deploy it commits a version bump, so the remote is usually one commit ahead of the local branch. Run `git pull --rebase` before pushing, or the push is rejected.

Conventions used so far: split the work into logical commits (docs in their own), each one building and passing on its own, which is checked in a throwaway `git worktree` before pushing; a short imperative subject and a body that says *why*; the `Co-Authored-By` trailer given in the session's attribution reminder.

## Working with the user

- **Stay inside this project.** Read files outside it only when the user names the path. Two sibling projects have come up as references: `~/project/voice-mirror` (its `deploy.yml` and version-bump script were the model for this deploy) and `~/project/_archive/eng-learn` (the earlier React version, where the verb objects came from). Do not browse `~/project/` or `_archive/` on your own.
- **The user asks whether English grammar is right** ("I hope I'm right regarding English grammar"). Answer honestly and say when their term or rule is off; they have welcomed it (*compound verb* became *verb phrase*, and "no contractions with linking *be*" was corrected). Grammar claims should be checked, not assumed.
- **Things they decided and do not want revisited:** stripes, not side-by-side cells, for contractions; two frames in questions; no archaic forms; arbitrary Tailwind values stay as they are; the all-three-aspects combination stays allowed.

## Project

**Sentence Constructor**: a Svelte 5 + Vite + Tailwind CSS v4 + TypeScript app, live at https://axln.github.io/eng-tense-aspect/ (repository `axln/eng-tense-aspect`, public). It replaces the big English tense tables: the user picks a subject, verb, object and aspect, and it generates the sentence for every tense/aspect/voice/negation/question combination, drawing each word as a tile labelled and coloured by its grammatical role. The audience is ESL learners and their teachers. It is a static site with no backend. Yarn Classic is the package manager (`yarn.lock`); tests use vitest; there is no ESLint or Prettier. It is MIT licensed (`LICENSE`, and `"license": "MIT"` in `package.json`), copyright Alexey Nesterenko.

`README.md` is for GitHub visitors, with a screenshot in `docs/screenshot.png` (taken at v0.1.10). Keep the facts in it checkable (it states 7 pronouns, 114 verbs, 11 modals) and retake the screenshot if the UI changes noticeably.

## Commands

- `yarn dev` — Vite dev server at http://localhost:5173/eng-tense-aspect/ (note the sub-path)
- `yarn build` / `yarn preview` — production build / serve it
- `yarn run check` — `svelte-check --tsconfig ./tsconfig.app.json` then `tsc -p tsconfig.node.json`
- `yarn bump-version` — **CI only; do not run it locally.** It edits `package.json`, and the deploy workflow does it once per deploy.
- `yarn test` — run all tests once (`yarn test:watch` to keep them running). One file: `yarn vitest run src/lib/Grammar.test.ts`; one test by name: `yarn vitest run -t "shall not"`

Always run type checks through `yarn run check` (or pass `--tsconfig ./tsconfig.app.json`). A bare `npx svelte-check` picks up the root `tsconfig.json`, which has `files: []`, so it checks nothing and reports 0 errors.

## Deployment (GitHub Pages)

Pushing to `main` runs `.github/workflows/deploy.yml`: `yarn install --frozen-lockfile`, `yarn bump-version`, `yarn run check`, `yarn test`, `yarn build`, then it publishes `dist/` to https://axln.github.io/eng-tense-aspect/, and finally commits the version bump back to `main`. A type error or a failing test stops the deploy. It can also be run by hand from the Actions tab (`workflow_dispatch`). The repository's Pages source must be set to **GitHub Actions** (Settings → Pages), otherwise the Pages steps fail.

- **The version bump.** `scripts/bump-version.mjs` adds 1 to the patch number in `package.json`, once per deploy, and the workflow commits it as `chore: bump version to vX.Y.Z [skip ci]` by `github-actions[bot]`. That is why the workflow has `contents: write`, and why the job is skipped when the commit message contains `[skip ci]`: the bump commit must not trigger another deploy. Do not bump the version by hand for a normal change.
- **The version is shown on the page** as a small pale-grey `v0.1.2` right after the title, inside the `h1`'s own text so it shares the title's baseline. `vite.config.ts` reads it from `package.json` and embeds it as the build-time constant `__APP_VERSION__` (declared in `src/vite-env.d.ts`, used in `App.svelte`). CI bumps *before* it builds, so the deployed page shows the version that is then committed back. `version.test.ts` checks that the version is three plain numbers (the bump script turns `1.0.0-beta` into `1.0.NaN`) and that the constant matches `package.json`.
- **Branch protection on `main` will break the last step** unless `github-actions[bot]` may bypass it: the site still deploys (the push comes last), but the job goes red.
- The site lives under a sub-path, so `vite.config.ts` sets `base: "/eng-tense-aspect/"`, and the dev server is at http://localhost:5173/eng-tense-aspect/. Vite prefixes the paths in `index.html` by itself, but **a path written in a component does not get the prefix**: use `import.meta.env.BASE_URL` (as the logo in `App.svelte` does) rather than `src="/favicon.svg"`, which would 404 on Pages. Renaming the repository means changing `base`.

## The `~` alias

`~` maps to `src/` and is used for all internal imports (`~/lib/Verb`, `~/type`). It has to be declared in two places that don't share config:
- `vite.config.ts` → `resolve.alias` (bundling)
- `tsconfig.app.json` → `compilerOptions.paths` (type checking / editor). The root `tsconfig.json` is a solution-style file with `references`, and its `compilerOptions` are not inherited by the referenced projects, so `paths` placed there has no effect.

## Architecture

The core is a pure sentence-building pipeline in `src/lib/`, kept free of UI concerns. The UI lives in `src/App.svelte` (controls) and `src/component/` (`Sentence.svelte`, `Word.svelte`, and `VerbForms.svelte`, the "forms" popup in the corner of the verb field, drawn as the user's "elementary chart of an English verb": base form in the centre, finite forms left, participles right, present above, past below, and each form that has more than one spelling (`go` / `goes`, `am` / `is` / `are`) listed with who uses it; the forms come from `verbForms` in `src/lib/VerbForms.ts`, which spells them with the same verb classes the sentences use), and is written with Svelte 5 runes (`$state`, `$derived`, `$props`). The colour of each part of the sentence is defined once, as `--color-role-*` tokens in the `@theme` block of `src/app.css` (utilities `bg-role-subject` and so on), and used by both the word tiles (`Word.svelte`) and the control that picks that part (the subject, verb, object and modal fields and the passive and negative checkboxes in `App.svelte`), so a control visibly matches the tile it produces. `--color-role-contraction` is the odd one out: a contraction is a property of a word rather than a part of speech, so it is drawn as a stripe on the tile (see *Contracted words* below), and the contractions checkbox uses it too. Change a colour there, not in either component.

`src/lib/SentenceSpec.ts` is the bridge between them. It holds `SentenceSpec`, a flat record of exactly what the controls bind to, plus the dropdown option lists and `specToParams`, which turns a spec into a fresh `SentenceParams`. Build the params fresh on every render: `buildSentence` mutates the verbs it is handed (it sets their `form`), so a reused `Verb` instance produces wrong output the second time.

Verb keys carry a list suffix (`ask:r`, `go:i`, `be:s`) because `lie` exists in both spelling lists, so the base form alone is not unique. `createVerb` maps the suffix to `Verb` / `IrregularVerb` / `BeVerb`.

Objects come from `src/spelling/ObjectList.ts`, which covers every verb in both spelling lists (3-5 `active` phrases each). `active` and `passive` are separate phrasings because the active object normally becomes the subject in the passive, leaving an agent or adverbial behind; an empty `passive` list means the verb has no natural passive. Lookup is by full verb key first, then verb base form, so `lie:r` (tell an untruth) and `lie:i` (recline) get different objects while every other verb is keyed by base form alone.

`required: true` marks a transitive verb that sounds unfinished bare (`I bring.`). For those the UI drops the "no object" choice and defaults to the first phrase. It applies to the **active voice only** — in the passive the object has become the subject, so `It is brought.` is complete and the choice is optional again. In the spec the choice is an index, with `NO_OBJECT` (-1) meaning none; `App.svelte` resets it via `defaultObjectIndex` whenever the verb or the voice changes, since an index only means something for one verb in one voice.

The three aspect checkboxes (perfect, continuous, passive) map straight onto `verbMode` and combine freely; none ticked means the simple (indefinite) aspect. All three at once is intentionally allowed — English permits it (`has been being asked`) even though it is vanishingly rare, so the UI labels it "rarely used together" rather than preventing it.

`buildSentence` (`src/lib/Sentence.ts`) is the entry point. It turns `SentenceParams` (mode, subject `Pronoun`, `verb`, `verbMode` flags for passive/continuous/perfect, negative, interrogative, contract, optional `Modal`) into a `Word[]` (`{ text, role, form? }`, defined in `src/type.ts`) in these steps:

1. **Verb chain** — `buildVerbChain` wraps the main verb by *prepending* auxiliaries in a fixed order: passive (`be` + v3), then continuous (`be` + ing), then perfect (`have` + v3). It also sets `form` on the head of the chain at each step, so the order of these blocks matters.
2. **Finite verb** — for `ModalVerb` mode the `Modal` is prepended. Otherwise `do` is prepended if the sentence is negative/interrogative and the first verb is neither `be` nor an *auxiliary* `have` (do-support), and `makePersonal(subject, isPresent)` sets the head verb to present or past agreeing with the subject. Main-verb `have` **does** take do-support (`I don't have a car`, not the formal `I haven't a car`); only its `WordRole` (`verb` vs `aux`) tells the two apart, so don't test `firstVerb.base` alone.
3. **Negation** — flags `negative`/`contract` are set on the *first* verb in the chain only; the verb's `renderToWords` emits either `not` or an `n't` suffix.
4. **Render, subject and object placement** — each verb renders to `Word[]`; the subject goes first, or after the first word for interrogative inversion; the optional `object` string is appended after the whole verb chain as a single `WordRole.object` word (a phrase like `a new phone` is one tile, not split).
5. **Contractions** — `applyContractions` (`src/lib/Helper.ts`) rewrites adjacent word pairs from the rule table in `src/spelling/Contractions.ts` (only when `contract`), and `can not` → `cannot` always applies. Finally, the end punctuation is appended and the first word capitalised.

`contractible` in `Helper.ts` encodes where English blocks a subject+verb contraction: when the verb is **stranded** at the end of the clause with the rest elided (`Yes, he is.`, never `Yes, he's.`), when it is a **semantic verb** rather than an auxiliary (`I have a car`, not `I've a car`), and when the **modal is being negated** (`I shall not go`, not the archaic `I'll not go`; the other negated modals have already become `won't`, `mustn't` etc. by then, so only `shall` reaches this check). The copula is the exception to the second rule — it carries `WordRole.verb` because it is the only verb in the chain, but `He's hungry.` is ordinary English, so `beForms` lets it contract. Stranding is detected by position: the end punctuation has not been appended yet, so the last element of the array is the last word of the clause.

`am not` is the gap in the negation paradigm — there is no standard `amn't` — and it is the only negation whose form depends on the sentence type, so `BeVerb` overrides `renderToWords`: a question takes suppletive `aren't I`, a statement emits an uncontracted `am` + `not` and lets the subject contract instead, giving `I'm not`. `BaseVerb.interrogative` exists solely to carry that distinction down from `buildSentence`.

### Styling (Tailwind v4)

Tailwind comes in through `@tailwindcss/vite` (before the Svelte plugin in `vite.config.ts`), and `src/app.css` is its entry: `@import "tailwindcss"`, then the design tokens in `@theme static` (the system UI font stack, `--color-brand`, and the `--color-role-*` colours). There are no `<style>` blocks; components are styled with utility classes in the markup. Things that will bite:

- **Class names must appear in the source in full.** Tailwind finds them by reading the text, so `bg-role-${role}` generates nothing and fails silently. `Word.svelte` keeps an explicit `roleBackground` lookup for this reason; `App.svelte` writes its repeated class strings out as constants (`field`, `select`, `chip`, `button`). Compose classes with Svelte's clsx-style `class` value, not string interpolation or the `class:` directive: `class={[field, "bg-role-object", { "opacity-45": objects.length === 0 }]}` (an array of strings, with objects for the conditional ones; falsy entries are dropped). Every class name in it is still a complete string literal, so Tailwind finds it.
- **Only `.svelte` files are scanned for class names** (`@import "tailwindcss" source(none)` plus `@source "./**/*.svelte"` in `app.css`). Tailwind's default is to read every text file, which turned the class names quoted in this file into unused CSS. The flip side: a class name written in a `.ts` file generates nothing, so keep class strings in the components.
- **The stripe gradient in `Word.svelte` is an inline style**, so it reads the tokens as `var(--color-role-*)`; that is why the theme block is `static`.
- **Preflight resets what the layout was designed on**, so the app restores it deliberately. In `app.css` a fixed `line-height: 24px` on `html` (Tailwind's 1.5 would grow the tiles) and the browser's 8px `body` margin. In the components, `max-w-[932px]` (border-box: 900px of content plus 16px padding each side) and `min-w-[66px]` / `min-w-[46px]` on tiles (the old `min-width` was content-box: 50px or 30px plus 16px of padding), `my-[0.67em]` on the `h1` and `my-4` on the `p` for the default margins, and `m-[3px_3px_3px_4px]` on checkboxes for theirs. Preflight also strips selects and buttons to nothing, so they are styled explicitly (`select`, `button` constants).
- **Do not use `text-sm`, `text-xs` and the like on text inside the tiles or captions.** Those set their own line height; the layout relies on the inherited 24px, so use an arbitrary size such as `text-[14px]`, which sets only the font size.
- **Arbitrary values such as `min-h-[47px]` and `text-[26px]` are intentional.** Tailwind IntelliSense hints that some can be written on its scale (`min-h-11.75`); that hint is turned off in `.vscode/settings.json` (`tailwindCSS.lint.suggestCanonicalClasses`). Do not "fix" them: the pixel values are the design, and the scale form hides them.
- `data-sentence` marks the root of each rendered sentence, a stable hook for tests and scripts that should not depend on class names.

### The verb phrase frame

English treats a chain like `have been going` as one verb: only its first word takes the tense and the agreement. `Sentence.svelte` draws that chain inside a frame titled **verb phrase**, and `groupVerbPhrase` in `src/lib/VerbPhrase.ts` decides what goes in it (the drawing is in the component; the rule is there so it can be tested). The rules:

- A phrase needs **at least two verbs of the chain** (auxiliaries, passive, main verb). `He goes.` and `He is hungry.` have one verb, so no frame. A `not` on its own is not a second verb, so `He is not hungry.` has none either; but once there is a phrase, the negation sits **inside** it (`has not been going`, or fused as `hasn't`).
- **The modal is not part of it** (the user's decision): it marks the kind of sentence, so `He will have gone` frames only `have gone`, and `He will go` has no frame. Its negation stays outside with it (`must not`, `can't`, `cannot`, `ought not to`, `had better not`): in a modal sentence the `not` belongs to the modal. The one exception is `should've`, a single word holding the modal and the auxiliary, which is framed whole like any contracted word.
- The subject, the object and the end mark are never in it.
- **In a question the subject moves into the chain** (`Have YOU been going?`), so the phrase is split; each run gets its own frame with the same title. That is deliberate: it shows one unit interrupted by the subject.
- A contracted word that holds part of the phrase is framed whole: `I'm` in `I'm asked` is one word on the page, and its stripes still show that the `I` is the subject.

The title is "verb phrase" (constant `verbPhraseTitle`), not "compound verb": in most grammars a compound verb is a verb built from two words, like `sleepwalk`, so the name would clash with what learners read elsewhere. "Verb group" is also standard. A frame adds 7px below its tiles (6px padding, 1px border), so unframed tiles get `mb-[7px]` **only when the sentence has a frame**, keeping every tile on one baseline; they sit in a `flex` wrapper because an `inline-flex` tile in a plain block picks up 4px of line-box height.

### Contracted words

A contracted word is several words written as one, so a `Word` made by a contraction carries `parts` (`{ text, role }[]`, defined in `src/type.ts`): `I'm` in `I'm asked` is the subject `I` + the passive auxiliary `'m`, and `hasn't` is the auxiliary `has` + the negation `n't`. Each part keeps the role it had before the words merged. `Word.svelte` draws the word as **one unbroken piece of text** on horizontal stripes: one equal stripe per part in reading order, each labelled with its role, plus a lavender `ctr` stripe for the contraction itself — so `I'm asked` shows pink, turquoise and lavender. Do not draw the parts as separate side-by-side cells: `She's` then reads as `She 's`, which is exactly the confusion a learner should not get. The invariants, all checked in `Parts.test.ts` across every combination:

- exactly the words with `form === "ctr"` have `parts`, and there are always at least two;
- the parts' texts joined equal `word.text`, and `word.role` is the first part's role, so anything that ignores `parts` still works;
- the end punctuation and the object are never part of a contraction.

There are two ways a contracted word is made, and both go through `contractedWord` / `contractedNegative` in `Helper.ts`, never a hand-built object:

1. **Merging two neighbours** (`mergeWords`, from the rule table): cut the contracted spelling at the apostrophe (`he|'s`, `should|'ve`), or, with none (`can not` → `cannot`), at the length of the first word (`can|not`).
2. **A negative rendered by a verb** (`Verb`, `Modal`, `BeVerb`): every contracted negative ends in `n't`, so the cut is always before those three letters, including the irregular `ca|n't` and `wo|n't`.

Anything that edits the text of a word must keep `parts` in step; that is what `capitalizeWord` is for (`he's` → `He` + `'s`). Use it rather than assigning to `word.text`. A word that is already a contraction is never merged again (no rule produces one); `mergeWords` keeps it whole rather than guess a cut.

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

## Tests

Tests live beside the code as `src/lib/*.test.ts` (plus `src/version.test.ts`), and `src/lib/testHelper.ts` exports `say(options)`, which builds a sentence as plain text with every option defaulted (`say({ subject: "I", verb: "have:i", object: "a car", contract: true })` → `"I have a car."`), and `words(options)`, which returns the `Word[]` instead. Use them rather than constructing `SentenceParams` by hand.

- `Contractions.test.ts` — what contracts and what must not, plus a sweep of tens of thousands of combinations for forms English forbids (`amn't`, `shan't`, a stranded `he's.`, a contracted main-verb `have`).
- `Grammar.test.ts` — do-support, agreement, the three aspects, question inversion, object placement.
- `Parts.test.ts` — the roles inside a contracted word, and the invariants of `parts` across every combination.
- `VerbPhrase.test.ts` — what is framed as the verb phrase, including questions, contractions and a lone `not`, plus a sweep of every combination.
- `VerbForms.test.ts` — the chart holds the forms the sentences actually use, checked for every verb against the pipeline rather than a second copy of the spelling rules.
- `Verb.test.ts` — known irregular spellings, plus rule checks over **every** verb in the lists. The spelling tables only hold exceptions, so a verb that needs one and lacks it fails silently (`catchs`, `giveing`); adding a verb to the lists is covered by those checks.

- `version.test.ts` — the version is three plain numbers and `__APP_VERSION__` matches `package.json`.

A bug found in the English output should get a test that fails first, then the fix. To be sure a new test can fail, break the code it covers on purpose and watch it fail, then restore.

## Verifying changes

Run `yarn run check`, `yarn test` and `yarn build` (the deploy runs the same). For anything visible, look at it in a real browser; type checks do not show a layout that is 4px off.

- **The browser.** There is no Chrome extension or `chromium-cli` here. Use headless Google Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --remote-debugging-port=9222 --window-size=1100,900 --user-data-dir=<scratch dir> about:blank`) and drive it through the DevTools Protocol from a small Node script (Node 24 has a built-in `WebSocket`, so no dependencies). Set a `<select>` by assigning `.value` and dispatching a bubbling `change` event; tick checkboxes with real `Input.dispatchMouseEvent` presses; screenshot with `Page.captureScreenshot` and open the PNG with the Read tool. Keep such scripts in the scratchpad, not the repo.
- **Refactors must not change the output.** Serve the previous commit from a `git worktree` (symlink `node_modules` into it) on another port and compare: measured layout (boxes, sizes, computed styles) with the same script against both, and a hash of every generated sentence (loop over all verbs, pronouns, modes, modals and flags via `ssrLoadModule`; ~1.7 million sentences, seconds). The Tailwind migration and the `requireSubject` fix were verified this way.
- **The deploy pipeline without GitHub.** Copy `git ls-files -co --exclude-standard` into a scratch directory, run the workflow's steps there, and use a local bare repository as the remote to test the commit-back step. The repository is public, so the GitHub API works with plain `curl` (`gh` is not installed): watch a run at `https://api.github.com/repos/axln/eng-tense-aspect/actions/runs`, and check the live bundle for the version string.
- **Traps.** This shell is zsh, which does not word-split an unquoted `$var`: `set -- $pair` and `for x in $list` misbehave, so pass arguments explicitly. Wait for Vite to reload after an edit before probing the page, or the probe runs mid-reload and returns nothing. Restart the dev server after changing `vite.config.ts` or the dependencies. Minified output uses template literals, so `grep` for a value without assuming its quotes. Do not leave a dev server or Chrome running: `lsof -ti:PORT -sTCP:LISTEN | xargs -r kill`.

## Known state

The audience is ESL learners, so the output must stay within everyday modern English: no archaic forms (`amn't`, `mayn't`, `shan't`), and no form a learner would be marked wrong for using. Where English has a gap or an awkward form, the app should produce what a teacher would actually teach.

- `yarn run check` is clean and must stay so: the deploy runs it. A present or past verb form needs a subject, and `Verb.requireSubject()` is the one place that says so (with a clear error) instead of dereferencing the optional `this.subject`; use it rather than a `!` assertion.
- The `should not` → `shouldn't` contraction rule in `Contractions.ts` is dead: negative modals are already rendered as `shouldn't` before contractions run. Deleting it is safe.

### Raised, not decided

Things that came up and were left open; ask before changing any of them.

- `get` uses `got` as its past participle (British); American English says `gotten`.
- Questions with `had better` and `ought to` come out formal (`Had I better go?`, `Ought I to go?`), as does `May I not go?`.
- `shall` is still a modal: `Shall we go?` is standard ESL material, but `I shall go` is dated.
- The perfect and continuous checkboxes have no colour; they produce the light-blue auxiliary tiles and could take that colour, as passive, negative and contractions do. The Mode control is uncoloured on purpose: it picks a tense, not a part of speech.
- `you` is typed as plural; a `you_singular` entry exists in `Pronoun.ts` but is commented out.
- A contracted word that holds part of the verb phrase is framed whole (`I'm` in `I'm asked`, with its subject stripe inside the frame). Revisit if learners find it confusing.
- The version sits inside the `h1`, so a screen reader announces "Sentence Constructor v0.1.3"; `aria-hidden` on it would avoid that.
