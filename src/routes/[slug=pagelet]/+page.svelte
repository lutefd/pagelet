<script lang="ts">
  import Callout from '$lib/components/markdown/Callout.svelte';
  import Card from '$lib/components/markdown/Card.svelte';
  import Checklist from '$lib/components/markdown/Checklist.svelte';
  import Gallery from '$lib/components/markdown/Gallery.svelte';
  import LinkCard from '$lib/components/markdown/LinkCard.svelte';
  import Timeline from '$lib/components/markdown/Timeline.svelte';
  import Map from '$lib/components/markdown/Map.svelte';
  import Event from '$lib/components/markdown/Event.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.page.meta.title} | Pagelet</title>
  {#if data.page.meta.description}
    <meta name="description" content={data.page.meta.description} />
  {/if}
</svelte:head>

<main class="site-shell document-page">
  <a class="back-link" href="/">Pagelet</a>

  <article class="document">
    {#each data.page.blocks as block, index}
      {#if block.kind === 'html'}
        <div class="markdown-body">
          {@html block.html}
        </div>
      {:else if block.name === 'callout'}
        <Callout {...(block.props as any)} />
      {:else if block.name === 'card'}
        <Card {...(block.props as any)} />
      {:else if block.name === 'link-card'}
        <LinkCard {...(block.props as any)} />
      {:else if block.name === 'gallery'}
        <Gallery {...(block.props as any)} />
      {:else if block.name === 'checklist'}
        <Checklist {...(block.props as any)} storageKey={`pagelet:${data.page.slug}:checklist:${index}`} />
      {:else if block.name === 'timeline'}
        <Timeline {...(block.props as any)} />
      {:else if block.name === 'map'}
        <Map {...(block.props as any)} />
      {:else if block.name === 'event'}
        <Event {...(block.props as any)} />
      {:else}
        <p class="component-error">Unknown component: {block.name}</p>
      {/if}
    {/each}
  </article>
</main>
