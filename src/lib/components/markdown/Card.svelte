<script lang="ts">
  let { title, content }: { title: string; content: string } = $props();
</script>

<section class="component card-block">
  <h3>{title}</h3>
  <p>{content}</p>
</section>
