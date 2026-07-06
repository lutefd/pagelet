<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Pagelet</title>
  <meta
    name="description"
    content="Small, polished shareable pages from Markdown and a few useful components."
  />
</svelte:head>

<main class="site-shell index-page">
  <section class="intro">
    <p class="eyebrow">Pagelet</p>
    <h1>Small, polished pages from Markdown.</h1>
    <p>
      Write a Markdown file, add a few useful components when plain text wants a hand, and
      share the result as a clean static page.
    </p>
  </section>

  <section class="page-list" aria-label="Published pages">
    {#each data.pages as page}
      <a class="page-card" href="/{page.slug}">
        <span>{page.title}</span>
        {#if page.description}
          <small>{page.description}</small>
        {/if}
      </a>
    {/each}
  </section>
</main>
