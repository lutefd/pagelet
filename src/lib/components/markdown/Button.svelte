<script lang="ts">
  let {
    href,
    label,
    variant = 'primary'
  }: { href: string; label: string; variant?: 'primary' | 'secondary' } = $props();
</script>

<div class="component action-block">
  <a class={`action-button action-button-${variant}`} href={href} target="_blank" rel="noreferrer">
    {label}<span aria-hidden="true">↗</span>
  </a>
</div>
