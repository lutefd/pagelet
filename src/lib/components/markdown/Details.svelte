<script lang="ts">
  let { title, content, open = false }: { title: string; content: string; open?: boolean } = $props();
</script>

<details class="component details-block" {open}>
  <summary>{title}<span aria-hidden="true">+</span></summary>
  <p>{content}</p>
</details>
