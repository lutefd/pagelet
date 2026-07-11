<script lang="ts">
  import { page } from '$app/state';

  const faces: Record<number, string> = { 404: '(╥﹏╥)', 500: '(×_×)' };
</script>

<svelte:head>
  <title>{page.status} — Pagelet wandered off</title>
</svelte:head>

<main class="error-page">
  <a class="wordmark error-wordmark" href="/"><span aria-hidden="true">p.</span> Pagelet</a>
  <div class="error-doodle error-doodle-one" aria-hidden="true">?</div>

  <section class="error-card">
    <p class="eyebrow"><span></span> HTTP {page.status}. Rude.</p>
    <p class="giant-status" aria-hidden="true">{page.status}</p>
    <h1>{page.status === 404 ? 'This pagelet slipped its leash.' : 'Something got weird backstage.'}</h1>
    <p>
      {page.status === 404
        ? 'The link may be stale, mistyped, or simply off having a little adventure.'
        : page.error?.message ?? 'The server needs a minute to collect itself.'}
    </p>
    <div class="hero-actions error-actions">
      <a class="button button-primary" href="/">Return to civilization <span>→</span></a>
      <button class="button button-quiet" type="button" onclick={() => history.back()}>Go back one tiny step</button>
    </div>
  </section>
  <div class="error-doodle error-doodle-two" aria-hidden="true">{faces[page.status] ?? '(•́  ‿ ,•̀)'}</div>
</main>
