<svelte:head>
  <title>Pagelet — Markdown, but make it shareable</title>
  <meta
    name="description"
    content="Give your agent some Markdown. Get back a polished little page with a URL."
  />
</svelte:head>

<main class="landing-page">
  <section class="hero-frame">
    <nav class="landing-nav" aria-label="Primary navigation">
      <a class="wordmark" href="/" aria-label="Pagelet home">
        <span aria-hidden="true">p.</span>
        Pagelet
      </a>
      <div class="nav-links">
        <a href="#how-it-works">How it works</a>
        <a href="/llms.txt">For agents ↗</a>
      </div>
    </nav>

    <div class="hero-grid">
      <div class="dangly dangly-spark" aria-hidden="true"><span>✦</span></div>
      <div class="dangly dangly-code" aria-hidden="true"><span>&lt;/&gt;</span></div>
      <div class="dangly dangly-hash" aria-hidden="true"><span>#</span></div>
      <div class="dangly dangly-arrow" aria-hidden="true"><span>↗</span></div>

      <div class="hero-copy">
        <p class="eyebrow"><span></span> Tiny pages. Big main-character energy.</p>
        <h1>Your Markdown called.<br /><em>It wants a URL.</em></h1>
        <p class="hero-lede">
          Hand your agent a scrappy <code>.md</code> file. Get back a polished, interactive
          page that is very ready to be perceived.
        </p>

        <div class="hero-actions">
          <a class="button button-primary" href="/pages">See what’s out there <span>↗</span></a>
          <a class="button button-quiet" href="/openapi.json">OpenAPI, if you insist ↗</a>
        </div>
      </div>

      <div class="install-ribbon" aria-label="Agent skill installation command">
        <span class="traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="install-label">teach your agent</span>
        <code>npx skills add lutefd/pagelet --skill pagelet-publish</code>
        <span class="ribbon-note">No hand-written curl incantations required.</span>
      </div>
    </div>
  </section>

  <section class="ticker" aria-label="Pagelet features">
    <div>
      <span>MARKDOWN IN</span><b>✦</b><span>PRETTY PAGE OUT</span><b>✦</b><span>AGENT NATIVE</span><b>✦</b
      ><span>ZERO CMS DRAMA</span><b>✦</b><span>SHARE THE THING</span>
    </div>
  </section>

  <section class="landing-section how-section" id="how-it-works">
    <div class="section-heading">
      <p class="eyebrow"><span></span> The suspiciously short process</p>
      <h2>From “notes_final_v7.md”<br />to <em>look at my little website.</em></h2>
    </div>

    <ol class="step-list">
      <li>
        <span class="step-number">01</span>
        <div><h3>Say the thing</h3><p>Ask your agent to publish, polish, or update some Markdown.</p></div>
        <span class="step-sticker sticker-blue" aria-hidden="true">.md</span>
      </li>
      <li>
        <span class="step-number">02</span>
        <div><h3>Let it cook</h3><p>Pagelet validates the words, components, links, and all the fiddly bits.</p></div>
        <span class="step-sticker sticker-yellow" aria-hidden="true">✓</span>
      </li>
      <li>
        <span class="step-number">03</span>
        <div><h3>Drop the link</h3><p>You get a clean public URL. Send it to a friend. Or your nemesis.</p></div>
        <span class="step-sticker sticker-green" aria-hidden="true">↗</span>
      </li>
    </ol>
  </section>

  <footer class="landing-footer">
    <a class="wordmark" href="/"><span aria-hidden="true">p.</span> Pagelet</a>
    <p>Made for documents too charming to stay attached to an email.</p>
    <a href="/llms.txt">psst, agents →</a>
  </footer>
</main>
