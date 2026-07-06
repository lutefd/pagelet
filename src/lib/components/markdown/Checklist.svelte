<script lang="ts">
  let { items }: { items: string[] } = $props();
</script>

<ul class="component checklist">
  {#each items as item}
    <li>
      <span aria-hidden="true"></span>
      {item}
    </li>
  {/each}
</ul>
