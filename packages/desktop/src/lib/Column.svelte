<script>
  import Card from './Card.svelte';

  export let title;
  export let columnId;
  export let cards;
  export let onEdit;
  export let onDrop;

  let isBottomDragOver = false;
  let dropZoneIndex = -1;
  let cardsContainer;
  let cardElements = [];

  $: count = cards.length;
  $: showWarning = columnId === 'in-progress' && count > 3;

  function calculateDropPosition(e) {
    if (!cardsContainer || cards.length === 0) return -1;

    const containerRect = cardsContainer.getBoundingClientRect();
    const mouseY = e.clientY;

    // Find all card elements
    const cardEls = Array.from(cardsContainer.querySelectorAll('.card'));
    
    for (let i = 0; i < cardEls.length; i++) {
      const cardRect = cardEls[i].getBoundingClientRect();
      const cardMiddle = cardRect.top + cardRect.height / 2;
      
      // If mouse is above the middle of this card, insert before it
      if (mouseY < cardMiddle) {
        return i;
      }
    }
    
    // If we get here, mouse is below all cards, return -1 for bottom area
    return -1;
  }

  function handleCardsDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const position = calculateDropPosition(e);
    
    if (position === -1) {
      // Mouse is in bottom area
      isBottomDragOver = true;
      dropZoneIndex = -1;
    } else {
      // Mouse is over a card drop zone
      isBottomDragOver = false;
      dropZoneIndex = position;
    }
  }

  function handleCardsDragLeave(e) {
    // Only clear if we're leaving the cards container entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      isBottomDragOver = false;
      dropZoneIndex = -1;
    }
  }

  function handleCardsDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const cardId = parseInt(e.dataTransfer.getData('text/plain'));
    const position = dropZoneIndex >= 0 ? dropZoneIndex : cards.length;
    
    isBottomDragOver = false;
    dropZoneIndex = -1;
    
    onDrop(cardId, columnId, position);
  }

</script>

<div class="column" data-column={columnId}>
  <div class="column-header">
    <div class="column-title">
      {title}
      <span class="column-count" class:warning={showWarning}>{count}</span>
    </div>
  </div>
  <div 
    class="cards"
    bind:this={cardsContainer}
    on:dragover={handleCardsDragOver}
    on:dragleave={handleCardsDragLeave}
    on:drop={handleCardsDrop}
    role="list"
  >
    {#if cards.length === 0}
      <!-- Full column drop area for empty column -->
      {#if isBottomDragOver}
        <div class="drop-indicator">
          Drop card here
        </div>
      {/if}
    {:else}
      {#each cards as card, index (card.id)}
        {#if dropZoneIndex === index}
          <div class="drop-indicator">
            Drop card here
          </div>
        {/if}
        <Card {card} {onEdit} />
      {/each}
      <!-- Bottom indicator when dragging below all cards -->
      {#if isBottomDragOver}
        <div class="drop-indicator">
          Drop card here
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .column {
    background: #fafaf8;
    border-radius: 4px;
    padding: 20px;
    min-height: calc(100vh - 180px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    min-width: 280px;
    display: flex;
    flex-direction: column;
  }

  .column-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e8e4db;
  }

  .column-title {
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #1a1a1a;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .column-count {
    font-size: 12px;
    color: #999;
    font-weight: 400;
    background: #f0ebe3;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .column-count.warning {
    background: #d4a574;
    color: #fafaf8;
  }

  .cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 50px;
    flex: 1;
    position: relative;
  }

  .drop-indicator {
    width: 100%;
    height: 80px;
    background-color: rgba(212, 164, 116, 0.1);
    border: 2px dashed #d4a574;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 13px;
    font-weight: 300;
  }
</style>
