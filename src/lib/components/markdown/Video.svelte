<script lang="ts">
  let {
    src,
    poster,
    title = 'Video',
    caption,
    captions,
    captionsLang = 'en',
    captionsLabel = 'Captions'
  }: {
    src: string;
    poster?: string;
    title?: string;
    caption?: string;
    captions?: string;
    captionsLang?: string;
    captionsLabel?: string;
  } = $props();

  let player: HTMLDivElement;
  let video: HTMLVideoElement;
  let progressFrame: number | undefined;
  let enhanced = $state(false);
  let playing = $state(false);
  let ended = $state(false);
  let muted = $state(false);
  let volume = $state(1);
  let playbackRate = $state(1);
  let currentTime = $state(0);
  let duration = $state(0);

  $effect(() => {
    enhanced = true;

    return () => {
      if (progressFrame !== undefined) {
        cancelAnimationFrame(progressFrame);
      }
    };
  });

  function syncTime() {
    currentTime = video.currentTime;
    duration = Number.isFinite(video.duration) ? video.duration : 0;
  }

  function trackProgress() {
    syncTime();

    if (!video.paused && !video.ended) {
      progressFrame = requestAnimationFrame(trackProgress);
    } else {
      progressFrame = undefined;
    }
  }

  function startProgressTracking() {
    if (progressFrame !== undefined) {
      cancelAnimationFrame(progressFrame);
    }

    progressFrame = requestAnimationFrame(trackProgress);
  }

  function stopProgressTracking() {
    if (progressFrame !== undefined) {
      cancelAnimationFrame(progressFrame);
      progressFrame = undefined;
    }

    syncTime();
  }

  async function togglePlayback() {
    if (ended) {
      video.currentTime = 0;
    }

    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  }

  function seek(event: Event) {
    const nextTime = Number((event.currentTarget as HTMLInputElement).value);
    video.currentTime = nextTime;
    currentTime = nextTime;
    ended = nextTime >= duration;
  }

  function applyPlaybackRate() {
    video.playbackRate = playbackRate;
  }

  function toggleMuted() {
    video.muted = !video.muted;
  }

  function setVolume(event: Event) {
    volume = Number((event.currentTarget as HTMLInputElement).value);
    video.volume = volume;
    video.muted = volume === 0;
  }

  function syncVolume() {
    muted = video.muted;
    volume = video.volume;
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await player.requestFullscreen();
    }
  }

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  }

  function progressStyle() {
    const progress = duration ? Math.min(currentTime / duration, 1) : 0;
    return `--video-progress: ${progress * 100}%`;
  }
</script>

<figure class="component video-player">
  <div class="video-player-frame" bind:this={player}>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video
      bind:this={video}
      {src}
      {poster}
      controls={!enhanced}
      playsinline
      preload="metadata"
      aria-label={title}
      onloadedmetadata={syncTime}
      ontimeupdate={syncTime}
      ondurationchange={syncTime}
      onplay={() => {
        playing = true;
        ended = false;
        startProgressTracking();
      }}
      onpause={() => {
        playing = false;
        stopProgressTracking();
      }}
      onended={() => {
        playing = false;
        ended = true;
        stopProgressTracking();
      }}
      onvolumechange={syncVolume}
    >
      {#if captions}
        <track kind="captions" src={captions} srclang={captionsLang} label={captionsLabel} default />
      {/if}
    </video>

    {#if enhanced}
      <div class="video-player-controls">
        <button
          type="button"
          class="video-control video-play"
          aria-label={ended ? 'Replay' : playing ? 'Pause' : 'Play'}
          onclick={togglePlayback}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            {#if ended}
              <path d="M20 7v5h-5" />
              <path d="M19 12a7 7 0 1 0-1.6 4.4" />
            {:else if playing}
              <path d="M7 5v14M17 5v14" />
            {:else}
              <path class="video-play-shape" d="m8 5 11 7-11 7Z" />
            {/if}
          </svg>
        </button>

        <input
          class="video-progress"
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          aria-label="Video position"
          oninput={seek}
          style={progressStyle()}
        />

        <span class="video-time" aria-label={`${formatTime(currentTime)} of ${formatTime(duration)}`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <select
          class="video-speed"
          aria-label="Playback speed"
          title="Playback speed"
          bind:value={playbackRate}
          onchange={applyPlaybackRate}
        >
          <option value={0.5}>0.5×</option>
          <option value={0.75}>0.75×</option>
          <option value={1}>1×</option>
          <option value={1.25}>1.25×</option>
          <option value={1.5}>1.5×</option>
          <option value={2}>2×</option>
        </select>

        <div class="video-volume">
          <div class="video-volume-popover">
            <input
              class="video-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              aria-label="Volume"
              aria-valuetext={`${Math.round(volume * 100)}%`}
              oninput={setVolume}
              style={`--video-volume: ${volume * 100}%`}
            />
          </div>

          <button type="button" class="video-control" aria-label={muted ? 'Unmute' : 'Mute'} onclick={toggleMuted}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 10v4h4l5 4V6l-5 4H5Z" />
              {#if muted || volume === 0}
                <path d="m17 10 4 4m0-4-4 4" />
              {:else if volume < 0.5}
                <path d="M17 11.2c.5.5.5 1.1 0 1.6" />
              {:else}
                <path d="M17 9c1.7 1.7 1.7 4.3 0 6" />
              {/if}
            </svg>
          </button>
        </div>

        <button type="button" class="video-control" aria-label="Toggle fullscreen" onclick={toggleFullscreen}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M8 4H4v4m12-4h4v4M8 20H4v-4m12 4h4v-4" />
          </svg>
        </button>
      </div>
    {/if}
  </div>

  {#if caption}
    <figcaption>{caption}</figcaption>
  {/if}
</figure>
