<script lang="ts">
  import { untrack } from "svelte";
  import { verbForms, type FormNote } from "~/lib/VerbForms";

  let { verbKey }: { verbKey: string } = $props();

  let open = $state(false);
  let shift = $state(0); // px, keeps the popup on the screen
  let button: HTMLButtonElement | undefined = $state();
  let popup: HTMLDivElement | undefined = $state();

  const forms = $derived(verbForms(verbKey));
  const verbName = $derived(verbKey.split(":")[0]);

  // The popup is centred on the verb field, which can sit near the edge of a
  // narrow screen: measure it once it is drawn and slide it back inside.
  const screenMargin = 8;

  $effect(() => {
    if (!open || !popup) return;

    // the rectangle includes the shift already applied, so take it out
    const applied = untrack(() => shift);
    const { left, right } = popup.getBoundingClientRect();
    const naturalLeft = left - applied;
    const naturalRight = right - applied;

    if (naturalLeft < screenMargin) {
      shift = screenMargin - naturalLeft;
    } else if (naturalRight > window.innerWidth - screenMargin) {
      shift = window.innerWidth - screenMargin - naturalRight;
    } else {
      shift = 0;
    }
  });

  // A click anywhere else closes the popup; a click on the button or inside
  // the popup is handled there.
  function onWindowClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (open && !button?.contains(target) && !popup?.contains(target)) {
      open = false;
    }
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (open && event.key === "Escape") {
      open = false;
      button?.focus();
    }
  }

  const heading = "text-center text-[13px] text-[#666]";
  // The title of a place in the chart is lighter than the comment on a form,
  // so "past (v2)" is not mistaken for "third singular (he, she, it)".
  const title = "text-[13px] leading-[18px] text-[#888]";
  const comment = "text-[13px] leading-[18px] text-[#666]";
  // (break-words: on a very narrow screen a long form breaks rather than push the page sideways)
  const cell = "flex min-h-[104px] flex-col items-center px-2 text-center break-words";

  // "he, she, it (third singular)", or just the pronouns when the group has no name
  const who = (note: FormNote): string =>
    note.term ? `${note.who.join(", ")} (${note.term})` : note.who.join(", ");

  // A form with a comment where the verb has more than one spelling of it:
  // ask / asks, and am / is / are, was / were for be. A single spelling needs
  // no comment.
  const entries = (notes: FormNote[]) =>
    notes.map((note) => ({ text: note.text, comment: notes.length > 1 ? who(note) : undefined }));

  // The forms of a cell are centred between its title and its lower edge. The
  // padding is the same in all four cells: 28px below keeps the base form,
  // which hangs 24px into the top row from the crossing, clear of the forms
  // above it, and matches the band the title takes at the top, so the forms
  // sit in the middle of the cell. The title is at the top of every cell, at
  // the left in the left column and at the right in the right one: the base
  // form hangs into the top inner corner of the bottom row, and the titles are
  // on the outer side of it. The alias is the other name many learners know
  // the form by.
  //
  // The lines are drawn by the cells: each has a top and a left edge, and the
  // last column and row close the chart, so a shared line is drawn once.
  const line = "border-t border-l border-[#d0d0d0]";
  const left = "self-start text-left";
  const right = "self-end text-right";

  const cells = $derived([
    { title: "present verb", alias: undefined, side: left, entries: entries(forms.presentNotes), bottom: false, place: `pt-2 pb-7 rounded-tl-[3px] ${line}` },
    { title: "present participle", alias: "-ing form", side: right, entries: [{ text: forms.presentParticiple, comment: undefined }], bottom: false, place: `pt-2 pb-7 rounded-tr-[3px] border-r ${line}` },
    { title: "past verb", alias: "v2", side: left, entries: entries(forms.pastNotes), bottom: true, place: `pt-2 pb-7 rounded-bl-[3px] border-b ${line}` },
    { title: "past participle", alias: "v3", side: right, entries: [{ text: forms.pastParticiple, comment: undefined }], bottom: true, place: `pt-2 pb-7 rounded-br-[3px] border-r border-b ${line}` },
  ]);
</script>

<svelte:window onclick={onWindowClick} onkeydown={onWindowKeydown} />

<!-- Both are positioned against the nearest `relative` ancestor: the wrapper of
     the verb field, so the button sits in its top right corner. -->
<button
  bind:this={button}
  type="button"
  class="absolute top-1.5 right-2.5 cursor-pointer text-[13px] text-[#555] underline decoration-dotted underline-offset-2 hover:text-black"
  aria-expanded={open}
  aria-controls="verb-forms"
  onclick={() => (open = !open)}
>
  forms
</button>

{#if open}
  <!-- The elementary chart of a verb: the finite forms on the left and the
       participles on the right, present above and past below, with the base
       form where the four meet. -->
  <div
    bind:this={popup}
    id="verb-forms"
    role="group"
    aria-label={`Forms of ${verbName}, ${forms.regular ? "regular" : "irregular"} verb`}
    class="absolute top-full left-1/2 z-10 mt-1 w-[560px] max-w-[calc(100vw-1rem)] rounded-[5px] border border-[#ddd] bg-white p-3 shadow-md"
    style:transform={`translateX(calc(-50% + ${shift}px))`}
  >
    <p class="mb-2 text-[13px] text-[#666]">
      Forms of <strong class="font-semibold text-black">{verbName}</strong>
      · {forms.regular ? "regular" : "irregular"} verb
    </p>

    <!-- One grid for the headings, the cells and the lines, so "present" and
         "past" stay level with their rows however tall each row is. -->
    <div class="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
      <span></span>
      <span class={[heading, "pb-1"]}>verb</span>
      <span class={[heading, "pb-1"]}>participle</span>

      {#each cells as { title: name, alias, side, entries: items, bottom, place }, index (name)}
        {#if index % 2 === 0}
          <span class="self-center pr-3 text-[13px] text-[#666]">{index === 0 ? "present" : "past"}</span>
        {/if}

        <span class={[cell, place, { relative: index === 0 }]}>
          <!-- the alias never breaks in the middle: it drops to the next line whole -->
          <span class={[title, side]}>
            {name}
            {#if alias}<span class="whitespace-nowrap">({alias})</span>{/if}
          </span>

          <!-- "third singular (he, she, it): asks": the comment comes first, and
               the form drops to the next line when the cell is too narrow for both -->
          <span class={["my-auto flex flex-col items-center gap-1", { "pt-1": bottom }]}>
            {#each items as item (item.text)}
              <span class="flex flex-wrap items-baseline justify-center gap-x-1.5">
                {#if item.comment}<span class={comment}>{item.comment}:</span>{/if}
                <span class="text-[18px] font-medium">{item.text}</span>
              </span>
            {/each}
          </span>

          <!-- The base form sits where the four cells meet: the inner corner of
               the present cell, whatever the heights of the rows. -->
          {#if index === 0}
            <span
              class="absolute right-0 bottom-0 z-10 flex min-w-[84px] translate-x-1/2 translate-y-1/2 flex-col items-center rounded-[5px] border border-[#767676]/50 bg-white px-3 py-0.5"
            >
              <span class={title}>base <span class="whitespace-nowrap">(bare)</span></span>
              <span class="text-[18px] font-semibold">{forms.base}</span>
            </span>
          {/if}
        </span>
      {/each}
    </div>
  </div>
{/if}
