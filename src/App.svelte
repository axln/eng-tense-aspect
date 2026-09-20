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

  // the modal verb mode is drawn separately, with its select beside the radio
  const tenseOptions = modeOptions.filter((option) => option.key !== SentenceMode.ModalVerb);
  const modalEnabled =$derived(spec.mode === SentenceMode.ModalVerb);
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

  // Preflight strips the browser's own look from selects and buttons, so they
  // are styled here. Tailwind reads class names from the source as written, so
  // these are spelled out in full rather than assembled from parts.
  const field = "flex flex-col gap-0.75 rounded-[5px] px-2.5 pt-1.5 pb-2.25";
  const fieldLabel = "text-[13px] text-[#555]"; // darker than the plain label: the grey is faint on a colour
  const select =
    "min-w-[130px] rounded-[5px] border border-[#767676] bg-white p-[5px] text-base text-black disabled:border-[#767676]/30 disabled:bg-[#efefef]/50 disabled:text-[#808080]";
  const chip = "flex items-center gap-1 rounded-[5px] px-2 py-0.5 whitespace-nowrap";
  // the browser gives a checkbox (or radio button) a small margin, which
  // preflight removes
  const checkbox = "m-[3px_3px_3px_4px]";
  // 17px and 7px, a pixel more than the 16px and 6px of padding, is the room a
  // native button reserves for its border
  const button =
    "rounded-md border border-[#767676] bg-[#efefef] px-[17px] py-[7px] text-base leading-[normal] text-black hover:bg-[#e3e3e3] disabled:border-[#767676]/30 disabled:bg-[#efefef] disabled:text-[#101010]/30";
</script>

<svelte:head>
  <title>English verb tense and aspect generator</title>
</svelte:head>

<main class="mx-auto max-w-[932px] px-4 pt-5 pb-15">
  <h1 class="my-[0.67em] flex items-center gap-2.5 text-[28px] font-semibold tracking-[-0.01em] text-brand">
    <img class="flex-none" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="36" height="36" />
    <!-- The version sits inside the title's own text, so it shares its baseline
         instead of being centred against the 36px logo. -->
    <span>
      Sentence Constructor
      <span class="text-[14px] font-normal tracking-normal text-[#b3b3b3]">v{__APP_VERSION__}</span>
    </span>
  </h1>

  <p class="my-4 max-w-[640px] text-[#666]">
    Pick a subject, a verb and an aspect to see how the verb chain is built. The three aspect
    boxes combine freely; with none of them ticked the sentence is in the simple (indefinite)
    aspect.
  </p>

  <div class="mb-6">
    <div class="mb-3 flex flex-wrap items-end gap-4">
      <label class={[field, "bg-role-subject"]}>
        <span class={fieldLabel}>Subject</span>
        <select class={select} bind:value={spec.pronounKey}>
          {#each pronounOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class={[field, "bg-role-verb"]}>
        <span class={fieldLabel}>Verb</span>
        <select class={select} bind:value={spec.verbKey}>
          {#each verbOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class={[field, "bg-role-object", { "opacity-45": objects.length === 0 }]}>
        <span class={fieldLabel}>Object</span>
        <select class={select} bind:value={spec.objectIndex} disabled={objects.length === 0}>
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

    <div class="mb-3 flex flex-wrap items-end gap-4">
      <fieldset class="flex flex-wrap gap-3 rounded-[5px] border border-[#ddd] px-3 pt-2 pb-2.5">
        <legend class="px-1 text-[13px] text-[#888]">Verb aspect and voice</legend>
        <label class={chip}><input class={checkbox} type="checkbox" bind:checked={spec.perfect} /> perfect</label>
        <label class={chip}><input class={checkbox} type="checkbox" bind:checked={spec.continuous} /> continuous</label>
        <label class={[chip, "bg-role-passive"]}
          ><input class={checkbox} type="checkbox" bind:checked={spec.passive} /> passive</label
        >
      </fieldset>

      <!-- Tense picks no part of speech, so it has no colour. -->
      <fieldset class="flex flex-wrap gap-3 rounded-[5px] border border-[#ddd] px-3 pt-2 pb-2.5">
        <legend class="px-1 text-[13px] text-[#888]">Tense or modal</legend>
        {#each tenseOptions as option (option.key)}
          <label class={chip}>
            <input class={checkbox} type="radio" name="mode" value={option.key} bind:group={spec.mode} />
            {option.label}
          </label>
        {/each}
        <!-- The modal verb belongs to the "modal verb" mode, so its field sits
             in the same group. The radio's label and the select are siblings:
             a label wrapping two controls would only ever govern the first. -->
        <!-- Not `chip`: its 2px of vertical padding leaves too thin a band of
             colour around the select, and a second py-* would fight it. -->
        <span
          class={[
            "flex items-center gap-1 rounded-[5px] px-2 py-1.25 whitespace-nowrap",
            modalEnabled ? "bg-role-modal" : "bg-role-modal/45",
          ]}
        >
          <label class="flex items-center gap-1">
            <input class={checkbox} type="radio" name="mode" value={SentenceMode.ModalVerb} bind:group={spec.mode} />
            modal verb:
          </label>
          <select
            class={select}
            aria-label="Modal verb"
            bind:value={spec.modalVerb}
            disabled={!modalEnabled}
          >
            {#each modalOptions as option (option.key)}
              <option value={option.key}>{option.label}</option>
            {/each}
          </select>
        </span>
      </fieldset>

      <fieldset class="flex flex-wrap gap-3 rounded-[5px] border border-[#ddd] px-3 pt-2 pb-2.5">
        <legend class="px-1 text-[13px] text-[#888]">Sentence mode</legend>
        <label class={[chip, "bg-role-negation"]}
          ><input class={checkbox} type="checkbox" bind:checked={spec.negative} /> negative</label
        >
        <label class={chip}
          ><input class={checkbox} type="checkbox" bind:checked={spec.interrogative} /> interrogative</label
        >
        <label class={[chip, "bg-role-contraction"]}
          ><input class={checkbox} type="checkbox" bind:checked={spec.contract} /> contractions</label
        >
      </fieldset>
    </div>
  </div>

  <Sentence {spec} />

  <div class="mt-5 flex gap-2">
    <button class={button} onclick={save}>Save</button>
    <button class={button} onclick={reset} disabled={saved.length === 0}>Clear saved</button>
  </div>

  {#if saved.length > 0}
    <div class="mt-4 border-t border-[#ddd] pt-2">
      {#each saved as savedSpec, index (index)}
        <Sentence spec={savedSpec} />
      {/each}
    </div>
  {/if}
</main>
