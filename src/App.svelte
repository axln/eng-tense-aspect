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

  // Preflight strips the browser's own look from selects and buttons, so they
  // are styled here. Tailwind reads class names from the source as written, so
  // these are spelled out in full rather than assembled from parts.
  const field = "flex flex-col gap-0.75 rounded-[5px] px-2.5 pt-1.5 pb-2.25";
  const fieldLabel = "text-[13px] text-[#555]"; // darker than the plain label: the grey is faint on a colour
  const select =
    "min-w-[130px] rounded-[5px] border border-[#767676] bg-white p-[5px] text-base text-black disabled:border-[#767676]/30 disabled:bg-[#efefef]/50 disabled:text-[#808080]";
  const chip = "flex items-center gap-1 rounded-[5px] px-2 py-0.5 whitespace-nowrap";
  // the browser gives a checkbox a small margin, which preflight removes
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
      <!-- Mode picks no part of speech, so it has no colour; it keeps the same
           padding as the coloured fields so the row stays aligned. -->
      <label class={field}>
        <span class="text-[13px] text-[#888]">Mode</span>
        <select class={select} bind:value={spec.mode}>
          {#each modeOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class={[field, "bg-role-modal", { "opacity-45": !modalEnabled }]}>
        <span class={fieldLabel}>Modal verb</span>
        <select class={select} bind:value={spec.modalVerb} disabled={!modalEnabled}>
          {#each modalOptions as option (option.key)}
            <option value={option.key}>{option.label}</option>
          {/each}
        </select>
      </label>
    </div>

    <div class="mb-3 flex flex-wrap items-end gap-4">
      <fieldset class="flex flex-wrap gap-3 rounded-[5px] border border-[#ddd] px-3 pt-2 pb-2.5">
        <legend class="px-1 text-[13px] text-[#888]">Aspect and voice</legend>
        <label class={chip}><input class={checkbox} type="checkbox" bind:checked={spec.perfect} /> perfect</label>
        <label class={chip}><input class={checkbox} type="checkbox" bind:checked={spec.continuous} /> continuous</label>
        <label class={[chip, "bg-role-passive"]}
          ><input class={checkbox} type="checkbox" bind:checked={spec.passive} /> passive</label
        >
      </fieldset>

      <fieldset class="flex flex-wrap gap-3 rounded-[5px] border border-[#ddd] px-3 pt-2 pb-2.5">
        <legend class="px-1 text-[13px] text-[#888]">Sentence type</legend>
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
