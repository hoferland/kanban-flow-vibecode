<script>
  import { onMount, onDestroy } from 'svelte';
  import { invoke } from '@tauri-apps/api/tauri';

  let serverRunning = false;
  let serverPort = 9899;
  let connectedClients = 0;
  let statusError = null;
  let statusInterval;

  async function checkStatus() {
    try {
      const status = await invoke('get_figma_sync_status');
      serverRunning = status.running;
      serverPort = status.port || 9899;
      connectedClients = status.connectedClients || 0;
      statusError = null;
    } catch (error) {
      statusError = error;
      serverRunning = false;
    }
  }

  async function toggleServer() {
    try {
      if (serverRunning) {
        await invoke('stop_figma_sync_server');
      } else {
        await invoke('start_figma_sync_server', { port: serverPort });
      }
      await checkStatus();
    } catch (error) {
      statusError = error;
    }
  }

  onMount(() => {
    checkStatus();
    statusInterval = setInterval(checkStatus, 5000);
  });

  onDestroy(() => {
    if (statusInterval) {
      clearInterval(statusInterval);
    }
  });
</script>

<div class="figma-sync-status">
  <button
    class="sync-toggle"
    class:active={serverRunning}
    on:click={toggleServer}
    title={serverRunning ? 'Stop Figma sync server' : 'Start Figma sync server'}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/>
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/>
      <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/>
      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/>
      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/>
    </svg>
    {#if serverRunning}
      <span class="status-dot connected"></span>
    {/if}
  </button>

  {#if serverRunning}
    <div class="sync-info">
      <span class="port">:{serverPort}</span>
      {#if connectedClients > 0}
        <span class="clients">{connectedClients} widget{connectedClients > 1 ? 's' : ''}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .figma-sync-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sync-toggle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: #f0f0f0;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sync-toggle:hover {
    background: #e0e0e0;
  }

  .sync-toggle.active {
    background: #18a0fb;
    color: white;
  }

  .sync-toggle.active:hover {
    background: #0d8de3;
  }

  .status-dot {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4caf50;
    border: 2px solid white;
  }

  .sync-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #666;
  }

  .port {
    font-family: monospace;
  }

  .clients {
    color: #18a0fb;
    font-weight: 500;
  }
</style>
