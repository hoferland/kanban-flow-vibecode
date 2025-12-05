<script>
  import { cards as cardsStore, currentFilter } from '../stores/cardStore.js';
  import Column from './Column.svelte';

  export let onEdit;

  const columns = [
    { id: 'inbox', title: 'Inbox' },
    { id: 'next', title: 'Next' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'waiting', title: 'Waiting' },
    { id: 'done', title: 'Done' }
  ];

  $: filteredCards = $cardsStore.filter(card => {
    return $currentFilter === 'all' || card.area === $currentFilter;
  });

  $: columnCards = columns.reduce((acc, column) => {
    acc[column.id] = filteredCards
      .filter(card => card.column === column.id)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    return acc;
  }, {});

  function handleDrop(cardId, newColumn, position) {
    cardsStore.moveCard(cardId, newColumn, position);
  }
</script>

<div class="board">
  {#each columns as column (column.id)}
    <Column 
      title={column.title}
      columnId={column.id}
      cards={columnCards[column.id]}
      {onEdit}
      onDrop={handleDrop}
    />
  {/each}
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    padding: 32px;
    max-width: 1800px;
    margin: 0 auto;
    overflow-x: auto;
  }
</style>
