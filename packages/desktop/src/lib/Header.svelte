<script>
  import { onMount } from 'svelte';
  import { currentFilter } from '../stores/cardStore.js';
  import { getVersion } from '@tauri-apps/api/app';

  export let onAddCard;
  export let onConfigureColumns;

  let appVersion = '';

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'team-a', label: 'SD Team' },
    { value: 'team-b', label: 'TM Team' },
    { value: 'cross-team', label: 'Cross-team' },
    { value: 'other', label: 'Other' }
  ];

  function setFilter(value) {
    currentFilter.set(value);
  }

  onMount(async () => {
    try {
      appVersion = await getVersion();
    } catch (err) {
      console.error('Failed to get app version:', err);
    }
  });
</script>

<div class="header">
  <div class="header-left">
    <h1>Flow</h1>
    {#if appVersion}
      <span class="version">v{appVersion}</span>
    {/if}
  </div>
  <div class="header-actions">
    <div class="filter-group">
      <span class="filter-label">Filter</span>
      {#each filters as filter}
        <button 
          class="filter-btn"
          class:active={$currentFilter === filter.value}
          on:click={() => setFilter(filter.value)}
        >
          {filter.label}
        </button>
      {/each}
    </div>
    <button class="config-btn" on:click={onConfigureColumns} title="Configure Columns" aria-label="Configure Columns">⚙</button>
    <button class="add-btn" on:click={onAddCard}>New Card</button>
  </div>
</div>

<style>
  .header {
    background: #fafaf8;
    padding: 20px 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header h1 {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: #1a1a1a;
  }

  .version {
    font-size: 11px;
    color: #999;
    font-weight: 400;
    background: #f0ebe3;
    padding: 4px 10px;
    border-radius: 12px;
    letter-spacing: 0.3px;
  }

  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .filter-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .filter-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
    font-weight: 400;
  }

  .filter-btn {
    padding: 6px 14px;
    background: transparent;
    border: 1px solid #d4d0c8;
    border-radius: 20px;
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #666;
    font-weight: 400;
  }

  .filter-btn:hover {
    background: #f0ebe3;
  }

  .filter-btn.active {
    background: #2d2d2d;
    color: #fafaf8;
    border-color: #2d2d2d;
  }

  .config-btn {
    padding: 10px;
    background: transparent;
    border: 1px solid #d4d0c8;
    border-radius: 4px;
    font-size: 18px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #666;
    font-weight: 400;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .config-btn:hover {
    background: #f0ebe3;
    color: #2d2d2d;
  }

  .add-btn {
    background: #2d2d2d;
    color: #fafaf8;
    border: none;
    padding: 10px 24px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    font-weight: 400;
    letter-spacing: 0.3px;
    transition: all 0.2s ease;
    height: 40px;
  }

  .add-btn:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
  }
</style>
