<script>
  import { onMount } from 'svelte';
  import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
  import { relaunch } from '@tauri-apps/api/process';
  
  let updateAvailable = false;
  let updateManifest = null;
  let isDownloading = false;
  let error = null;

  async function checkForUpdates() {
    try {
      const { shouldUpdate, manifest } = await checkUpdate();
      
      if (shouldUpdate) {
        updateAvailable = true;
        updateManifest = manifest;
      }
    } catch (err) {
      // Silently fail - don't show errors to user for update checks
      console.error('Update check failed:', err);
      error = err.message;
    }
  }

  async function handleUpdate() {
    try {
      isDownloading = true;
      error = null;
      
      // Download and install the update
      await installUpdate();
      
      // Relaunch the app to apply the update
      await relaunch();
    } catch (err) {
      console.error('Update installation failed:', err);
      error = 'Failed to install update. Please try again later.';
      isDownloading = false;
    }
  }

  function dismissUpdate() {
    updateAvailable = false;
  }

  onMount(() => {
    // Check for updates when component mounts
    checkForUpdates();
  });
</script>

{#if updateAvailable && !isDownloading}
  <div class="update-notification">
    <div class="update-content">
      <div class="update-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <h3>Update Available</h3>
      </div>
      
      <p class="update-version">
        Version {updateManifest?.version} is ready to install
      </p>
      
      {#if updateManifest?.body}
        <div class="update-notes">
          <p class="notes-title">What's new:</p>
          <p class="notes-content">{updateManifest.body}</p>
        </div>
      {/if}
      
      <div class="update-actions">
        <button class="btn-primary" on:click={handleUpdate}>
          Update Now
        </button>
        <button class="btn-secondary" on:click={dismissUpdate}>
          Later
        </button>
      </div>
    </div>
  </div>
{/if}

{#if isDownloading}
  <div class="update-notification downloading">
    <div class="update-content">
      <div class="spinner"></div>
      <p>Downloading update...</p>
      <p class="download-info">The app will restart automatically when complete.</p>
    </div>
  </div>
{/if}

{#if error}
  <div class="update-notification error">
    <div class="update-content">
      <p class="error-message">{error}</p>
      <button class="btn-secondary" on:click={() => error = null}>
        Dismiss
      </button>
    </div>
  </div>
{/if}

<style>
  .update-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 20px;
    max-width: 400px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(120%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .update-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .update-header {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #2c3e50;
  }

  .update-header svg {
    color: #3498db;
  }

  .update-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .update-version {
    margin: 0;
    color: #7f8c8d;
    font-size: 14px;
  }

  .update-notes {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
    margin: 4px 0;
  }

  .notes-title {
    margin: 0 0 8px 0;
    font-weight: 600;
    font-size: 13px;
    color: #2c3e50;
  }

  .notes-content {
    margin: 0;
    font-size: 13px;
    color: #5a6c7d;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .update-actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
  }

  .btn-primary {
    background: #3498db;
    color: white;
  }

  .btn-primary:hover {
    background: #2980b9;
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: #ecf0f1;
    color: #2c3e50;
  }

  .btn-secondary:hover {
    background: #d5dbdb;
  }

  .downloading {
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .downloading p {
    margin: 4px 0;
    color: #2c3e50;
  }

  .download-info {
    font-size: 13px;
    color: #7f8c8d;
  }

  .error {
    background: #fee;
  }

  .error-message {
    margin: 0 0 12px 0;
    color: #c0392b;
    font-size: 14px;
  }
</style>
