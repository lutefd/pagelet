<script lang="ts">
  type CalloutType = 'info' | 'warning' | 'success' | 'error';

  let { type = 'info', content }: { type?: CalloutType; content: string } = $props();
</script>

<aside class={`component callout callout-${type}`}>
  <strong>{type}</strong>
  <p>{content}</p>
</aside>
