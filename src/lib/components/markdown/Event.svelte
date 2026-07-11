<script lang="ts">
  let {
    title,
    date,
    time,
    timezone,
    location,
    href
  }: {
    title: string;
    date: string;
    time?: string;
    timezone?: string;
    location?: string;
    href?: string;
  } = $props();
</script>

<section class="component event-card">
  <div class="event-card-date" aria-label={date}>
    <span>{date.slice(5, 7)}</span>
    <strong>{date.slice(8, 10)}</strong>
    <small>{date.slice(0, 4)}</small>
  </div>
  <div class="event-card-copy">
    <h3>{title}</h3>
    {#if time}<p>{time}{timezone ? ` · ${timezone}` : ''}</p>{/if}
    {#if location}<p>{location}</p>{/if}
  </div>
  {#if href}
    <a href={href} target="_blank" rel="noreferrer">Add to calendar <span aria-hidden="true">↗</span></a>
  {/if}
</section>
