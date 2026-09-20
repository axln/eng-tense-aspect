<script lang="ts">
  import type { Word } from "~/type";

  let { word }: { word: Word } = $props();
</script>

<div class="word {word.role}" class:contracted={word.form === "ctr"}>
  <div class="meta">
    <span class="role">{word.role}</span>
    {#if word.form}
      <span class="form">{word.form}</span>
    {/if}
  </div>
  <span class="text">{word.text}</span>
</div>

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

  /* an inset stripe rather than a border, so the tile keeps its size */
  .word.contracted {
    box-shadow: inset 0 -5px 0 var(--role-contraction);
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
