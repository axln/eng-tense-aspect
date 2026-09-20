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

<div class="my-4" data-sentence>
  <div class="mb-1.5 text-[14px] text-[#888]">
    {describeSpec(spec)}
    {#if allThreeAspects}
      <span class="ml-1.5 rounded-[5px] bg-[#fdf0d5] px-1.5 py-px text-[#96702a]">rarely used together</span>
    {/if}
  </div>

  {#if result.error}
    <div class="text-base text-[#b3261e]">{result.error}</div>
  {:else}
    <div class="flex flex-wrap items-end gap-2">
      {#each result.words as word, index (index)}
        <Word {word} />
      {/each}
    </div>
  {/if}
</div>
