<script lang="ts">
  let { images }: { images: string[] } = $props();
</script>

<div class="component gallery" aria-label="Image gallery">
  {#each images as image}
    <img src={image} alt="" loading="lazy" />
  {/each}
</div>
