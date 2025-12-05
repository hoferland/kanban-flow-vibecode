<script>
  export let card;
  export let onEdit;

  let isDragging = false;
  let wasDragging = false;

  const typeIcons = {
    'discovery': '◆',
    'design': '○',
    'support': '□'
  };

  const areaLabels = {
    'team-a': 'SD Team',
    'team-b': 'TM Team',
    'cross-team': 'Cross-team',
    'other': 'Other'
  };

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id.toString());
    isDragging = true;
    wasDragging = true;
    
    // Add a slight delay to allow the drag image to be created
    setTimeout(() => {
      e.target.style.opacity = '0';
    }, 0);
  }

  function handleDragEnd(e) {
    isDragging = false;
    e.target.style.opacity = '1';
    
    // Reset wasDragging after a short delay to allow click to be prevented
    setTimeout(() => {
      wasDragging = false;
    }, 100);
  }

  function handleClick(e) {
    // Prevent opening modal if we just finished dragging
    if (wasDragging) {
      e.stopPropagation();
      return;
    }
    onEdit(card);
  }
</script>

<div 
  class="card"
  class:dragging={isDragging}
  draggable="true"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && onEdit(card)}
>
  <div class="card-title">{card.title}</div>
  <div class="card-meta">
    <span class="area-tag {card.area}">{areaLabels[card.area]}</span>
    {#if card.type && typeIcons[card.type]}
      <span class="type-icon">{typeIcons[card.type]} {card.type}</span>
    {/if}
  </div>
</div>

<style>
  .card {
    background: #ffffff;
    border: 1px solid #e8e4db;
    border-radius: 4px;
    padding: 16px;
    cursor: move;
    transition: all 0.2s ease;
    user-select: none;
  }

  .card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  .card.dragging {
    opacity: 0;
    cursor: grabbing;
  }

  .card-title {
    font-size: 14px;
    font-weight: 400;
    color: #1a1a1a;
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .card-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .area-tag {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 400;
    letter-spacing: 0.3px;
  }

  .area-tag.team-a {
    background: #d4e4f0;
    color: #4a7396;
  }

  .area-tag.team-b {
    background: #d4e8d4;
    color: #507050;
  }

  .area-tag.cross-team {
    background: #f0dcc8;
    color: #96734a;
  }

  .area-tag.other {
    background: #e8e4db;
    color: #666;
  }

  .type-icon {
    font-size: 11px;
    color: #999;
    font-weight: 400;
  }
</style>
