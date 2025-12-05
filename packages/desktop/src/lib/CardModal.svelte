<script>
  import { cards } from '../stores/cardStore.js';

  export let isOpen = false;
  export let editingCard = null;

  let title = '';
  let area = 'team-a';
  let type = '';
  let notes = '';

  $: isEditing = !!editingCard;
  $: modalTitle = isEditing ? 'Edit Card' : 'New Card';

  $: if (editingCard) {
    title = editingCard.title;
    area = editingCard.area;
    type = editingCard.type || '';
    notes = editingCard.notes || '';
  }

  export function open(card = null) {
    editingCard = card;
    if (card) {
      title = card.title;
      area = card.area;
      type = card.type || '';
      notes = card.notes || '';
    } else {
      resetForm();
    }
    isOpen = true;
  }

  export function close() {
    isOpen = false;
    editingCard = null;
    resetForm();
  }

  function resetForm() {
    title = '';
    area = 'team-a';
    type = '';
    notes = '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    const cardData = {
      title,
      area,
      type,
      notes
    };

    if (isEditing) {
      cards.updateCard(editingCard.id, cardData);
    } else {
      cards.addCard(cardData);
    }

    close();
  }

  function handleDelete() {
    if (!editingCard) return;
    
    if (confirm('Delete this card?')) {
      cards.deleteCard(editingCard.id);
      close();
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal" on:click={handleBackdropClick}>
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">{modalTitle}</h2>
        <button class="close-btn" on:click={close}>&times;</button>
      </div>
      
      <form on:submit={handleSubmit}>
        <div class="form-group">
          <label class="form-label" for="card-title">Title *</label>
          <input 
            type="text" 
            class="form-input" 
            id="card-title"
            bind:value={title}
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="card-area">Area</label>
          <select class="form-select" id="card-area" bind:value={area}>
            <option value="team-a">SD Team</option>
            <option value="team-b">TM Team</option>
            <option value="cross-team">Cross-team</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="card-type">Type</label>
          <select class="form-select" id="card-type" bind:value={type}>
            <option value="">None</option>
            <option value="discovery">Discovery</option>
            <option value="design">Design</option>
            <option value="support">Support</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="card-notes">Notes</label>
          <textarea 
            class="form-textarea" 
            id="card-notes"
            bind:value={notes}
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" on:click={close}>Cancel</button>
          <button type="submit" class="btn-primary">Save Card</button>
        </div>

        {#if isEditing}
          <button type="button" class="btn-delete" on:click={handleDelete}>
            Delete Card
          </button>
        {/if}
      </form>
    </div>
  </div>
{/if}

<style>
  .modal {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: #fafaf8;
    padding: 40px;
    border-radius: 4px;
    box-shadow: 0 8px 60px rgba(0, 0, 0, 0.15);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .modal-title {
    font-size: 18px;
    font-weight: 500;
    color: #1a1a1a;
    letter-spacing: 0.3px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #2d2d2d;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 400;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #d4d0c8;
    border-radius: 4px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    background: #ffffff;
    color: #2d2d2d;
    transition: all 0.2s ease;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #2d2d2d;
  }

  .form-textarea {
    resize: vertical;
    min-height: 100px;
    line-height: 1.6;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;
  }

  .btn-primary {
    flex: 1;
    background: #2d2d2d;
    color: #fafaf8;
    border: none;
    padding: 14px 24px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    font-weight: 400;
    letter-spacing: 0.3px;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    background: #1a1a1a;
  }

  .btn-secondary {
    flex: 1;
    background: transparent;
    color: #666;
    border: 1px solid #d4d0c8;
    padding: 14px 24px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    font-weight: 400;
    letter-spacing: 0.3px;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: #f0ebe3;
  }

  .btn-delete {
    background: transparent;
    color: #d4a574;
    border: 1px solid #d4a574;
    padding: 14px 24px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    font-weight: 400;
    letter-spacing: 0.3px;
    transition: all 0.2s ease;
    margin-top: 16px;
    width: 100%;
  }

  .btn-delete:hover {
    background: #d4a574;
    color: #fafaf8;
  }
</style>
