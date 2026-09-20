<script lang="ts">
  import Word from "~/component/Word.svelte";
  import { buildSentence } from "~/lib/Sentence";
  import { describeSpec, specToParams, type SentenceSpec } from "~/lib/SentenceSpec";
  import { groupVerbPhrase } from "~/lib/VerbPhrase";

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

  // English treats a chain like "have been going" as one verb, so it is framed
  // and titled. "Verb phrase" is the standard term; "compound verb" means
  // something else in most grammars (a verb like "sleepwalk").
  const verbPhraseTitle = "verb phrase";

  const chunks = $derived(groupVerbPhrase(result.words));
  const hasFrame = $derived(chunks.some((chunk) => chunk.verbPhrase));
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
      {#each chunks as chunk, index (index)}
        {#if chunk.verbPhrase}
          <!-- In a question the subject splits the phrase in two, so there can
               be two of these with the same title. -->
          <div
            class="inline-flex flex-col rounded-lg border border-brand/50 px-1.5 pb-1.5"
            role="group"
            aria-label={verbPhraseTitle}
          >
            <span class="px-0.5 text-[11px] leading-[14px] text-brand">{verbPhraseTitle}</span>
            <div class="flex gap-2">
              {#each chunk.words as word, wordIndex (wordIndex)}
                <Word {word} />
              {/each}
            </div>
          </div>
        {:else}
          <!-- A frame adds 7px below its tiles (6px of padding and a 1px
               border); the same margin keeps every tile on one baseline. Only
               when there is a frame, so a plain sentence is laid out as before.
               The wrapper is a flex container: as a plain block, the line box
               around an inline-flex tile adds 4px of height. -->
          <div class={["flex", { "mb-[7px]": hasFrame }]}>
            <Word word={chunk.words[0]} />
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
