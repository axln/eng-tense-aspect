<script lang="ts">
  import type { Word } from "~/type";

  let { word }: { word: Word } = $props();

  // One equal horizontal stripe per part, top to bottom in reading order, then
  // one for the contraction itself. Every role name is also the name of its
  // --role-* colour.
  const stripeColors = $derived(
    word.parts
      ? [...word.parts.map((part) => `var(--role-${part.role})`), "var(--role-contraction)"]
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
       with its own role, and a lavender one for the contraction itself. -->
  <div class="word contracted" title="contraction" style:background-image={stripes}>
    <div class="stripes">
      {#each word.parts as part, index (index)}
        <span class="stripe">{part.role}</span>
      {/each}
      <span class="stripe">ctr</span>
    </div>
    <span class="text">{word.text}</span>
  </div>
{:else}
  <div class="word {word.role}">
    <div class="meta">
      <span class="role">{word.role}</span>
      {#if word.form}
        <span class="form">{word.form}</span>
      {/if}
    </div>
    <span class="text">{word.text}</span>
  </div>
{/if}

<style>
  /* A flex column rather than absolute labels, so the tile always grows
     wide enough to keep the role and form labels from colliding. */
  .word {
    display: inline-flex;
    flex-direction: column;
    min-width: 50px;
    padding: 3px 8px 6px;
    border-radius: 5px;
    text-align: center;
    background-color: #eee;
  }

  /* The labels sit in a column on the left and the word on the right. The
     stripes are equal thirds (or quarters) of the height, and the labels split
     the height equally too, so each label lands on its own stripe. */
  .word.contracted {
    flex-direction: row;
    align-items: stretch;
    gap: 10px;
    min-height: 47px; /* the height of an ordinary tile, so the row stays level */
    padding: 0 10px 0 8px;
  }

  .stripes {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    font-size: 11px;
    line-height: 14px;
    text-align: left;
    opacity: 0.75;
  }

  .stripe {
    display: flex;
    flex: 1;
    align-items: center;
  }

  .word.contracted .text {
    align-self: center;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
    line-height: 14px;
    opacity: 0.75;
  }

  .meta :only-child {
    margin-right: auto;
  }

  .text {
    font-size: 26px;
  }

  .word.subject {
    background-color: var(--role-subject);
  }

  .word.verb {
    background-color: var(--role-verb);
  }

  .word.aux {
    background-color: var(--role-aux);
  }

  .word.passive {
    background-color: var(--role-passive);
  }

  .word.modal {
    background-color: var(--role-modal);
  }

  .word.negation {
    background-color: var(--role-negation);
  }

  .word.object {
    background-color: var(--role-object);
  }

  .word.end {
    min-width: 30px;
    background-color: var(--role-end);
  }
</style>
