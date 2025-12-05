<script>
  import Header from './lib/Header.svelte';
  import Board from './lib/Board.svelte';
  import CardModal from './lib/CardModal.svelte';
  import UpdateNotification from './lib/UpdateNotification.svelte';

  let modal;

  function handleAddCard() {
    modal.open();
  }

  function handleEditCard(card) {
    modal.open(card);
  }
</script>

<main>
  <Header onAddCard={handleAddCard} />
  <Board onEdit={handleEditCard} />
  <CardModal bind:this={modal} />
  <UpdateNotification />
</main>

<style>
  main {
    width: 100%;
    min-height: 100vh;
  }
</style>
