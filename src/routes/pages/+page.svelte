<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Published Pagelets</title>
  <meta name="description" content="A directory of Markdown documents living their best public lives." />
</svelte:head>

<main class="directory-page">
  <nav class="directory-nav">
    <a class="wordmark" href="/"><span aria-hidden="true">p.</span> Pagelet</a>
    <a href="/">← Back to the loud bit</a>
  </nav>

  <section class="directory-shell">
    <header class="directory-heading">
      <p class="eyebrow"><span></span> Fresh from the Markdown oven</p>
      <h1>Published<br /><em>pagelets.</em></h1>
      <p>Small documents living their best public lives. Please do not tap on the glass.</p>
    </header>

    {#if data.pages.length}
      <div class="page-list">
        {#each data.pages as page, index}
          <a class="page-card" href="/{page.slug}">
            <span class="page-card-index">{String(index + 1).padStart(2, '0')}</span>
            <span class="page-card-copy">
              <strong>{page.title}</strong>
              {#if page.description}<small>{page.description}</small>{/if}
            </span>
            <span class="page-card-arrow" aria-hidden="true">↗</span>
          </a>
        {/each}
      </div>
    {:else}
      <div class="empty-pagelet">
        <span aria-hidden="true">( •_•)</span>
        <div><h2>Awkward. The shelf is empty.</h2><p>Publish the first Pagelet and become extremely historically important.</p></div>
      </div>
    {/if}
  </section>
</main>
