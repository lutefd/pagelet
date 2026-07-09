<script lang="ts">
  import { browser } from '$app/environment';

  let { items, storageKey }: { items: string[]; storageKey: string } = $props();
  let checked = $state<boolean[]>([]);
  let hydrated = $state(false);

  $effect(() => {
    if (!browser) {
      return;
    }

    checked = readStoredState(storageKey, items.length);
    hydrated = true;
  });

  function toggle(index: number) {
    checked = checked.map((value, itemIndex) => (itemIndex === index ? !value : value));
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }

  function readStoredState(key: string, length: number): boolean[] {
    const fallback = Array.from({ length }, () => false);
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return fallback;
      }

      return fallback.map((value, index) => (typeof parsed[index] === 'boolean' ? parsed[index] : value));
    } catch {
      return fallback;
    }
  }
</script>

<ul class="component checklist">
  {#each items as item, index}
    <li class:checked={hydrated && checked[index]}>
      <button type="button" aria-pressed={hydrated && checked[index]} onclick={() => toggle(index)}>
        <span aria-hidden="true"></span>
        {item}
      </button>
    </li>
  {/each}
</ul>
