<script lang="ts">
  import Word from "~/component/Word.svelte";
  import { buildSentence } from "~/lib/Sentence";
  import { describeSpec, specToParams, type SentenceSpec } from "~/lib/SentenceSpec";

  let { spec }: { spec: SentenceSpec } = $props();

  // buildSentence throws on combinations the grammar core doesn't cover yet,
  // so a bad pick shows a message instead of blanking the whole page.
  const result = $derived.by(() => {
    try {
      return { words: buildSentence(specToParams(spec)), error: null };
    } catch (err) {
      return { words: [], error: err instanceof Error ? err.message : String(err) };
    }
  });

  // Grammatical, but "has been being asked" is awkward enough that it is
  // vanishingly rare in real use.
  const allThreeAspects = $derived(spec.passive && spec.continuous && spec.perfect);
</script>

<div class="sentence">
  <div class="caption">
    {describeSpec(spec)}
    {#if allThreeAspects}
      <span class="rare">rarely used together</span>
    {/if}
  </div>

  {#if result.error}
    <div class="error">{result.error}</div>
  {:else}
    <div class="words">
      {#each result.words as word, index (index)}
        <Word {word} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .sentence {
    margin: 16px 0;
  }

  .caption {
    margin-bottom: 6px;
    font-size: 14px;
    color: #888;
  }

  .rare {
    margin-left: 6px;
    padding: 1px 6px;
    border-radius: 5px;
    background-color: #fdf0d5;
    color: #96702a;
  }

  .words {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-end;
  }

  .error {
    color: #b3261e;
    font-size: 16px;
  }
</style>
