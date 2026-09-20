<script lang="ts">
  import Sentence from "~/component/Sentence.svelte";
  import { ModalVerb } from "~/lib/Modal";
  import { SentenceMode } from "~/lib/Sentence";
  import {
    defaultObjectIndex,
    modalOptions,
    modeOptions,
    NO_OBJECT,
    objectRequired,
    objectsFor,
    pronounOptions,
    verbOptions,
    type SentenceSpec,
  } from "~/lib/SentenceSpec";

  let spec: SentenceSpec = $state({
    pronounKey: "I",
    verbKey: "ask:r",
    mode: SentenceMode.PresentTense,
    modalVerb: ModalVerb.can,
    passive: false,
    continuous: false,
    perfect: false,
    negative: false,
    interrogative: false,
    contract: false,
    objectIndex: defaultObjectIndex("ask:r", false),
  });

  let saved: SentenceSpec[] = $state([]);

  const modalEnabled = $derived(spec.mode === SentenceMode.ModalVerb);
  const objects = $derived(objectsFor(spec.verbKey, spec.passive));
  const objectNeeded = $derived(objectRequired(spec.verbKey, spec.passive));

  // Objects belong to one verb and one voice, so a stale index would point at
  // an unrelated phrase (or past the end of a shorter list): reset the choice
  // whenever either changes.
  let lastObjectSource = `${spec.verbKey}|${spec.passive}`;
  $effect(() => {
    const source = `${spec.verbKey}|${spec.passive}`;

    if (source !== lastObjectSource) {
      lastObjectSource = source;
      spec.objectIndex = defaultObjectIndex(spec.verbKey, spec.passive);
    }
  });

  function save(): void {
    saved = [...saved, { ...spec }];
  }

  function reset(): void {
    saved = [];
  }
</script>

<svelte:head>
  <title>English verb tense and aspect generator</title>
</svelte:head>

<main>
  <h1>
    <img class="logo" src="/favicon.svg" alt="" width="36" height="36" />
    Sentence Constructor
  </h1>

  <p class="desc">
    Pick a subject, a verb and an aspect to see how the verb chain is built. The three aspect
    boxes combine freely; with none of them ticked the sentence is in the simple (indefinite)
    aspect.
  </p>

  <div class="controls">
    <div class="row">
      <label class="field">
        <span class="label">Subject</span>
        <select bind:value={spec.pronounKey}>
          {#each pronounOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="field">
        <span class="label">Verb</span>
        <select bind:value={spec.verbKey}>
          {#each verbOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="field" class:disabled={objects.length === 0}>
        <span class="label">Object</span>
        <select bind:value={spec.objectIndex} disabled={objects.length === 0}>
          {#if !objectNeeded}
            <option value={NO_OBJECT}>
              {objects.length === 0 ? "none available" : "— no object —"}
            </option>
          {/if}
          {#each objects as object, index (object)}
            <option value={index}>{object}</option>
          {/each}
        </select>
      </label>

    </div>

    <div class="row">
      <label class="field">
        <span class="label">Mode</span>
        <select bind:value={spec.mode}>
          {#each modeOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="field" class:disabled={!modalEnabled}>
        <span class="label">Modal verb</span>
        <select bind:value={spec.modalVerb} disabled={!modalEnabled}>
          {#each modalOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="row">
      <fieldset>
        <legend>Aspect and voice</legend>
        <label><input type="checkbox" bind:checked={spec.perfect} /> perfect</label>
        <label><input type="checkbox" bind:checked={spec.continuous} /> continuous</label>
        <label><input type="checkbox" bind:checked={spec.passive} /> passive</label>
      </fieldset>

      <fieldset>
        <legend>Sentence type</legend>
        <label><input type="checkbox" bind:checked={spec.negative} /> negative</label>
        <label><input type="checkbox" bind:checked={spec.interrogative} /> interrogative</label>
        <label><input type="checkbox" bind:checked={spec.contract} /> contractions</label>
      </fieldset>
    </div>
  </div>

  <Sentence {spec} />

  <div class="buttons">
    <button onclick={save}>Save</button>
    <button onclick={reset} disabled={saved.length === 0}>Clear saved</button>
  </div>

  {#if saved.length > 0}
    <div class="saved">
      {#each saved as savedSpec, index (index)}
        <Sentence spec={savedSpec} />
      {/each}
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px 16px 60px;
  }

  h1 {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo {
    flex: none;
  }

  .desc {
    max-width: 640px;
    color: #666;
  }

  .controls {
    margin-bottom: 24px;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 12px;
    align-items: flex-end;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .field.disabled {
    opacity: 0.45;
  }

  .label {
    font-size: 13px;
    color: #888;
  }

  select {
    min-width: 130px;
    padding: 5px;
    font-size: 16px;
  }

  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 8px 12px 10px;
    margin: 0;
  }

  legend {
    font-size: 13px;
    color: #888;
    padding: 0 4px;
  }

  fieldset label {
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .buttons {
    display: flex;
    gap: 8px;
    margin-top: 20px;
  }

  button {
    padding: 6px 16px;
    font-size: 16px;
  }

  .saved {
    margin-top: 16px;
    border-top: 1px solid #ddd;
    padding-top: 8px;
  }
</style>
