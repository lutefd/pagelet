<script lang="ts">
  let {
    name,
    address,
    href
  }: { name: string; address: string; href: string } = $props();
</script>

<section class="component map-card">
  <span class="map-card-pin" aria-hidden="true">●</span>
  <span class="map-card-copy">
    <strong>{name}</strong>
    <small>{address}</small>
  </span>
  <a href={href} target="_blank" rel="noreferrer">Open in Maps <span aria-hidden="true">↗</span></a>
</section>
