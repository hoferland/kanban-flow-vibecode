<script>
  import Card from './Card.svelte';

  export let title;
  export let columnId;
  export let cards;
  export let maxCards = null;
  export let onEdit;
  export let onDrop;
  export let onDragStart;
  export let onDragEnd;
  export let draggedCardId;
  export let isDragging;

  let isBottomDragOver = false;
  let dropZoneIndex = -1;
  let cardsContainer;
  let lastCalculatedPosition = -1;
  let cachedIndicatorTop = 0;
  let cachedIndicatorLeft = 0;
  let cachedIndicatorWidth = 0;
  let lastMouseY = 0;
  const HYSTERESIS_THRESHOLD = 8; // pixels

  $: count = cards.length;
  $: hasMaxCards = maxCards != null;
  $: showWarning = hasMaxCards && count > /** @type {number} */ (maxCards);

  function calculateDropIndicatorState(e) {
    if (!cardsContainer || cards.length === 0) {
      return { dropIndex: -1, indicatorTop: 0, indicatorLeft: 0, indicatorWidth: 0 };
    }

    const mouseY = e.clientY;
    const containerRect = cardsContainer.getBoundingClientRect();

    // Single DOM query and filter pass
    const cardEls = Array.from(cardsContainer.querySelectorAll('[data-card-id]'))
      .filter(el => {
        const cardId = parseInt(el.getAttribute('data-card-id'));
        return cardId !== draggedCardId;
      });

    if (cardEls.length === 0) {
      return {
        dropIndex: -1,
        indicatorTop: 0,
        indicatorLeft: containerRect.left,
        indicatorWidth: containerRect.width
      };
    }

    // Check if mouse is before the first card
    const firstCardRect = cardEls[0].getBoundingClientRect();
    if (mouseY < firstCardRect.top) {
      return {
        dropIndex: 0,
        indicatorTop: firstCardRect.top - 5,
        indicatorLeft: containerRect.left,
        indicatorWidth: containerRect.width
      };
    }

    // Hysteresis: only recalculate if moved beyond threshold
    const mouseDelta = Math.abs(mouseY - lastMouseY);
    const shouldRecalculate = mouseDelta > HYSTERESIS_THRESHOLD || lastCalculatedPosition === -1;

    if (!shouldRecalculate && lastCalculatedPosition >= 0) {
      // Return cached values for stability
      return {
        dropIndex: lastCalculatedPosition,
        indicatorTop: cachedIndicatorTop,
        indicatorLeft: cachedIndicatorLeft,
        indicatorWidth: cachedIndicatorWidth
      };
    }

    // Find drop position by checking each card
    for (let i = 0; i < cardEls.length; i++) {
      const cardRect = cardEls[i].getBoundingClientRect();
      const cardMiddle = cardRect.top + (cardRect.height / 2);

      // If in top half of this card, drop before it
      if (mouseY < cardMiddle) {
        return {
          dropIndex: i,
          indicatorTop: cardRect.top - 5,
          indicatorLeft: containerRect.left,
          indicatorWidth: containerRect.width
        };
      }

      // Check if there's a next card
      if (i < cardEls.length - 1) {
        const nextCardRect = cardEls[i + 1].getBoundingClientRect();
        // If in gap or bottom half of current but before middle of next
        if (mouseY < nextCardRect.top + (nextCardRect.height / 2)) {
          return {
            dropIndex: i + 1,
            indicatorTop: nextCardRect.top - 5,
            indicatorLeft: containerRect.left,
            indicatorWidth: containerRect.width
          };
        }
      }
    }

    // Mouse is after all cards - position indicator below the last card
    const lastCardRect = cardEls[cardEls.length - 1].getBoundingClientRect();
    return {
      dropIndex: -1,
      indicatorTop: lastCardRect.bottom + 5,
      indicatorLeft: containerRect.left,
      indicatorWidth: containerRect.width
    };
  }

  function handleDragOver(e) {
    if (!draggedCardId) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    // Calculate everything atomically
    const state = calculateDropIndicatorState(e);

    // Only update if position actually changed
    if (state.dropIndex === lastCalculatedPosition) {
      return;
    }

    lastCalculatedPosition = state.dropIndex;
    lastMouseY = e.clientY;

    // Cache the indicator position for stable rendering
    cachedIndicatorTop = state.indicatorTop;
    cachedIndicatorLeft = state.indicatorLeft;
    cachedIndicatorWidth = state.indicatorWidth;

    // Update indicators immediately (no setTimeout needed)
    const draggedCardIndex = cards.findIndex(c => c.id === draggedCardId);
    updateIndicators(state.dropIndex, draggedCardIndex);
  }

  function updateIndicators(position, draggedCardIndex) {
    if (position === -1) {
      isBottomDragOver = true;
      dropZoneIndex = -1;
    } else {
      const isFromSameColumn = draggedCardIndex !== -1;
      const isSamePosition = isFromSameColumn && (position === draggedCardIndex || position === draggedCardIndex + 1);

      if (isSamePosition) {
        isBottomDragOver = false;
        dropZoneIndex = -1;
      } else {
        isBottomDragOver = false;
        dropZoneIndex = position;
      }
    }
  }

  function handleDragLeave(e) {
    const relatedTarget = e.relatedTarget;

    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      lastCalculatedPosition = -1;
      lastMouseY = 0;
      isBottomDragOver = false;
      dropZoneIndex = -1;
      // Reset cached indicator values
      cachedIndicatorTop = 0;
      cachedIndicatorLeft = 0;
      cachedIndicatorWidth = 0;
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedCardId) return;

    lastCalculatedPosition = -1;
    lastMouseY = 0;

    const targetPosition = dropZoneIndex >= 0 ? dropZoneIndex : cards.length;

    isBottomDragOver = false;
    dropZoneIndex = -1;

    // Reset cached indicator values
    cachedIndicatorTop = 0;
    cachedIndicatorLeft = 0;
    cachedIndicatorWidth = 0;

    onDrop(draggedCardId, columnId, targetPosition);
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
  class="column"
  data-column={columnId}
  role="region"
  aria-label="{title} column"
>
  <div class="column-header">
    <div class="column-title">
      {title}
      <span class="column-count" class:warning={showWarning}>{count}</span>
    </div>
  </div>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    class="cards"
    bind:this={cardsContainer}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="list"
  >
    {#if cards.length === 0}
      {#if isBottomDragOver}
        <div class="drop-indicator">
          Drop card here
        </div>
      {/if}
    {:else}
      {#each cards as card, index (card.id)}
        <div class="card-wrapper" data-card-id={card.id}>
          <Card
            {card}
            {onEdit}
            onDragStart={() => onDragStart(card.id)}
            onDragEnd={() => onDragEnd()}
          />
        </div>
      {/each}
      {#if isBottomDragOver}
        <div class="drop-indicator">
          Drop card here
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Global indicator overlay - uses cached position for stability -->
{#if (dropZoneIndex >= 0 || isBottomDragOver) && cardsContainer}
  <div
    class="drop-indicator-global"
    style="top: {cachedIndicatorTop}px; left: {cachedIndicatorLeft}px; width: {cachedIndicatorWidth}px;"
  ></div>
{/if}

<style>
  .column {
    background: #fafaf8;
    border-radius: 4px;
    padding: 20px;
    min-height: calc(100vh - 180px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    width: 320px;
    flex-shrink: 0;
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

  .cards > :global(*) {
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
    pointer-events: none;
    flex-shrink: 0;
  }

  .drop-indicator-global {
    position: fixed;
    height: 3px;
    background-color: #d4a574;
    border-radius: 2px;
    pointer-events: none;
    z-index: 9999;
  }

  .drop-indicator-overlay {
    /* Not used anymore */
  }

  .card-wrapper {
    /* No position needed */
  }

  .drop-indicator-compact {
    /* Removed - using global overlay instead */
  }
</style>
