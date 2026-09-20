<script lang="ts">
  import type { SentenceParams } from "~/lib/Sentence";
  import { IrregularVerb } from "~/lib/IrregularVerb";
  import { Pronoun } from "~/lib/Pronoun";
  import { Modal, ModalVerb } from "~/lib/Modal";
  import { buildSentence, SentenceMode } from "~/lib/Sentence";

  const sentenceParams: SentenceParams = {
    subject: new Pronoun("he"),
    // mode: SentenceMode.ModalVerb,
    mode: SentenceMode.PresentTense,
    modalVerb: new Modal(ModalVerb.can),
    verb: new IrregularVerb("go"),
    verbMode: {
      passive: false,
      continuous: false,
      perfect: false,
    },
    negative: true,
    interrogative: true,
    // interrogative: false,
    contract: true,
  };

  const words = buildSentence(sentenceParams);
</script>

<svelte:head>
  <title>English verb tense and aspect generator</title>
</svelte:head>

<main>
  <h1>Sentence</h1>

  {#each words as word}
    <div class="word">
      <div class="role">{word.role}</div>
      <div class="text">{word.text}</div>
    </div>
  {/each}
</main>

<style>
  .word {
    display: inline-block;
    margin-right: 10px;
    background-color: #eee;
    padding: 20px 5px 5px;
    border-radius: 5px;
    position: relative;
    min-width: 40px;
    text-align: center;
  }

  .role {
    position: absolute;
    font-size: 12px;
    top: 0;
    left: 3px;
  }

  .text {
    font-size: 18px;
  }
</style>
