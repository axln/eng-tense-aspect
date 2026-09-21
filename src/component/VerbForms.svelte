<script lang="ts">
  import { untrack } from "svelte";
  import { verbForms } from "~/lib/VerbForms";

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
  // a form sits at the outer edge of its cell, away from the base form in the
  // middle of the chart
  const cell = "flex min-h-[92px] justify-center px-2 py-2 text-center text-[18px] font-medium";
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
    aria-label={`Forms of ${verbName}`}
    class="absolute top-full left-1/2 z-10 mt-1 w-[440px] max-w-[calc(100vw-1rem)] rounded-[5px] border border-[#ddd] bg-white p-3 shadow-md"
    style:transform={`translateX(calc(-50% + ${shift}px))`}
  >
    <div class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
      <span></span>
      <div class="grid grid-cols-2">
        <span class={heading}>verb</span>
        <span class={heading}>participle</span>
      </div>

      <div class="grid grid-rows-2">
        <span class="self-center text-[13px] text-[#666]">present</span>
        <span class="self-center text-[13px] text-[#666]">past</span>
      </div>

      <div class="relative grid grid-cols-2 grid-rows-2 rounded-[3px] border border-[#ccc]">
        <span class={[cell, "items-start border-r border-b border-[#ddd]"]}>{forms.present}</span>
        <span class={[cell, "items-start border-b border-[#ddd]"]}>{forms.presentParticiple}</span>
        <span class={[cell, "items-end border-r border-[#ddd]"]}>{forms.past}</span>
        <span class={[cell, "items-end"]}>{forms.pastParticiple}</span>

        <span
          class="absolute top-1/2 left-1/2 flex min-w-[84px] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[5px] border border-[#767676]/50 bg-white px-3 py-0.5"
        >
          <span class="text-[13px] text-[#555]">base</span>
          <span class="text-[18px] font-semibold">{forms.base}</span>
        </span>
      </div>
    </div>
  </div>
{/if}
