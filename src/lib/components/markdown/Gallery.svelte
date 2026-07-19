<script lang="ts">
  let {
    images,
    fit = 'cover',
    aspect = 'landscape',
    size = 'full'
  }: {
    images: string[];
    fit?: 'cover' | 'contain';
    aspect?: 'landscape' | 'square' | 'portrait' | 'natural';
    size?: 'full' | 'medium' | 'small';
  } = $props();
</script>

<div
  class="component gallery"
  data-fit={fit}
  data-aspect={aspect}
  data-size={size}
  aria-label="Image gallery"
>
  {#each images as image}
    <img src={image} alt="" loading="lazy" />
  {/each}
</div>
