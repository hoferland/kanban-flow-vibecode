import { writable } from 'svelte/store';

// Sample data
const initialCards = [
    {
        id: Date.now() + 1,
        title: 'Review design system components',
        area: 'cross-team',
        type: 'design',
        notes: '',
        column: 'in-progress'
    },
    {
        id: Date.now() + 2,
        title: 'User testing for new checkout flow',
        area: 'team-a',
        type: 'discovery',
        notes: '',
        column: 'next'
    },
    {
        id: Date.now() + 3,
        title: 'Update mobile navigation patterns',
        area: 'team-b',
        type: 'design',
        notes: '',
        column: 'inbox'
    }
];

// Load from localStorage or use initial data
function loadCards() {
    if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('kanbanCards');
        if (saved) {
            return JSON.parse(saved);
        }
    }
    return initialCards;
}

// Create the store
function createCardStore() {
    const { subscribe, set, update } = writable(loadCards());

    return {
        subscribe,
        addCard: (card) => update(cards => {
            // Find the highest position in the inbox column
            const inboxCards = cards.filter(c => c.column === 'inbox');
            const maxPosition = inboxCards.length > 0 
                ? Math.max(...inboxCards.map(c => c.position || 0))
                : -1;
            
            const newCard = {
                id: Date.now(),
                ...card,
                column: 'inbox',
                position: maxPosition + 1
            };
            const updated = [...cards, newCard];
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('kanbanCards', JSON.stringify(updated));
            }
            return updated;
        }),
        updateCard: (id, updates) => update(cards => {
            const updated = cards.map(card => 
                card.id === id ? { ...card, ...updates } : card
            );
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('kanbanCards', JSON.stringify(updated));
            }
            return updated;
        }),
        deleteCard: (id) => update(cards => {
            const updated = cards.filter(card => card.id !== id);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('kanbanCards', JSON.stringify(updated));
            }
            return updated;
        }),
        moveCard: (id, newColumn, newPosition) => update(cards => {
            // Find the card being moved
            const movedCard = cards.find(card => card.id === id);
            if (!movedCard) return cards;

            const oldColumn = movedCard.column;
            const oldPosition = movedCard.position || 0;

            // If moving within the same column
            if (oldColumn === newColumn) {
                const updated = cards.map(card => {
                    if (card.id === id) {
                        return { ...card, position: newPosition };
                    }
                    // Adjust positions of other cards in the same column
                    if (card.column === newColumn) {
                        const cardPos = card.position || 0;
                        if (oldPosition < newPosition) {
                            // Moving down: shift cards between old and new position up
                            if (cardPos > oldPosition && cardPos <= newPosition) {
                                return { ...card, position: cardPos - 1 };
                            }
                        } else {
                            // Moving up: shift cards between new and old position down
                            if (cardPos >= newPosition && cardPos < oldPosition) {
                                return { ...card, position: cardPos + 1 };
                            }
                        }
                    }
                    return card;
                });
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('kanbanCards', JSON.stringify(updated));
                }
                return updated;
            }

            // Moving to a different column
            const updated = cards.map(card => {
                if (card.id === id) {
                    return { ...card, column: newColumn, position: newPosition };
                }
                // Adjust positions in the old column (shift up)
                if (card.column === oldColumn && (card.position || 0) > oldPosition) {
                    return { ...card, position: (card.position || 0) - 1 };
                }
                // Adjust positions in the new column (shift down)
                if (card.column === newColumn && (card.position || 0) >= newPosition) {
                    return { ...card, position: (card.position || 0) + 1 };
                }
                return card;
            });

            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('kanbanCards', JSON.stringify(updated));
            }
            return updated;
        })
    };
}

export const cards = createCardStore();
export const currentFilter = writable('all');
