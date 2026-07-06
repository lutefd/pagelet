<script lang="ts">
  let { href, title, description }: { href: string; title: string; description?: string } = $props();
</script>

<a class="component link-card" href={href} target="_blank" rel="noreferrer">
  <span>
    <strong>{title}</strong>
    {#if description}
      <small>{description}</small>
    {/if}
  </span>
  <span aria-hidden="true">↗</span>
</a>
