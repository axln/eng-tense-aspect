<script lang="ts">
  import type { Word } from "~/type";

  let { word }: { word: Word } = $props();
</script>

<div class="word {word.role}">
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

  .word.subject {
    background-color: lightpink;
  }

  .word.verb {
    background-color: lightgreen;
  }

  .word.aux {
    background-color: lightskyblue;
  }

  .word.passive {
    background-color: mediumturquoise;
  }

  .word.modal {
    background-color: coral;
  }

  .word.negation {
    background-color: lightgray;
  }

  .word.object {
    background-color: cornsilk;
  }

  .word.end {
    min-width: 30px;
    background-color: beige;
  }
</style>
