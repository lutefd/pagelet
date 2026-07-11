<script lang="ts">
  let { embedUrl, title = 'Spotify player' }: { embedUrl: string; title?: string } = $props();
</script>

<div class="component media-embed spotify-embed">
  <iframe
    src={embedUrl}
    title={title}
    loading="lazy"
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  ></iframe>
</div>
