<script lang="ts">
  let { embedUrl, title = 'YouTube video' }: { embedUrl: string; title?: string } = $props();
</script>

<div class="component media-embed youtube-embed">
  <iframe
    src={embedUrl}
    title={title}
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>
