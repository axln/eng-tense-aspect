<script lang="ts">
  import type { Word } from "~/type";
  import { WordRole } from "~/type";

  let { word }: { word: Word } = $props();

  // Tailwind finds a class by reading its full name in the source, so a name
  // built as `bg-role-${role}` would generate no CSS at all. Spell them out.
  const roleBackground: Record<WordRole, string> = {
    [WordRole.subject]: "bg-role-subject",
    [WordRole.verb]: "bg-role-verb",
    [WordRole.aux]: "bg-role-aux",
    [WordRole.passive]: "bg-role-passive",
    [WordRole.modal]: "bg-role-modal",
    [WordRole.negation]: "bg-role-negation",
    [WordRole.object]: "bg-role-object",
    [WordRole.end]: "bg-role-end",
  };

  // One equal horizontal stripe per part, top to bottom in reading order, then
  // one for the contraction itself. The stripes are an inline gradient, so they
  // read the colour tokens as CSS variables rather than as utilities.
  const stripeColors = $derived(
    word.parts
      ? [
          ...word.parts.map((part) => `var(--color-role-${part.role})`),
          "var(--color-role-contraction)",
        ]
      : []
  );

  const stripes = $derived.by(() => {
    const step = 100 / stripeColors.length;
    const bands = stripeColors.map((color, i) => `${color} ${i * step}% ${(i + 1) * step}%`);

    return `linear-gradient(to bottom, ${bands.join(", ")})`;
  });
</script>

{#if word.parts}
  <!-- A contraction is several words written as one, so the word stays one
       unbroken piece of text ("She's", never "She" + "'s"). What it is made of
       is shown by horizontal stripes behind it: one per part, each labelled
       with its own role, and a lavender one for the contraction itself.
       The labels sit in a column on the left and the word on the right. The
       stripes are equal fractions of the height, and the labels split the
       height equally too, so each label lands on its own stripe. The height
       matches an ordinary tile, so the row stays level. -->
  <div
    class="inline-flex min-h-[47px] flex-row items-stretch gap-2.5 rounded-[5px] pr-2.5 pl-2 text-center"
    title="contraction"
    style:background-image={stripes}
  >
    <div class="flex flex-col justify-stretch text-left text-[11px] leading-[14px] opacity-75">
      {#each word.parts as part, index (index)}
        <span class="flex flex-1 items-center">{part.role}</span>
      {/each}
      <span class="flex flex-1 items-center">ctr</span>
    </div>
    <span class="self-center text-[26px]">{word.text}</span>
  </div>
{:else}
  <!-- A flex column rather than absolute labels, so the tile always grows wide
       enough to keep the role and form labels from colliding. -->
  <div
    class={[
      "inline-flex flex-col rounded-[5px] px-2 pt-0.75 pb-1.5 text-center",
      roleBackground[word.role],
      // the old min-widths were content-box: 50px, or 30px for the end mark, plus 16px of padding
      word.role === WordRole.end ? "min-w-[46px]" : "min-w-[66px]",
    ]}
  >
    <div class="flex justify-between gap-3 text-[11px] leading-[14px] opacity-75">
      <span class="mr-auto">{word.role}</span>
      {#if word.form}
        <span>{word.form}</span>
      {/if}
    </div>
    <span class="text-[26px]">{word.text}</span>
  </div>
{/if}
