<script lang="ts">
  let { items }: { items: string[] } = $props();
</script>

<ol class="component timeline">
  {#each items as item}
    <li>{item}</li>
  {/each}
</ol>
