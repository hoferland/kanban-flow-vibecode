import { writable, get } from 'svelte/store';
import { invoke } from '@tauri-apps/api/tauri';
import { areas, types } from './attributeStore.js';
import { columns } from './columnStore.js';

// Sample data for fallback
const initialCards = [
    {
        id: Date.now() + 1,
        title: 'Review design system components',
        area: 'cross-team',
        type: 'design',
        notes: '',
        column: 'in-progress',
        position: 0,
        dueDate: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: Date.now() + 2,
        title: 'User testing for new checkout flow',
        area: 'team-a',
        type: 'discovery',
        notes: '',
        column: 'next',
        position: 0,
        dueDate: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
    },
    {
        id: Date.now() + 3,
        title: 'Update mobile navigation patterns',
        area: 'team-b',
        type: 'design',
        notes: '',
        column: 'inbox',
        position: 0,
        dueDate: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
];

// Load cards from database
async function loadCards() {
    try {
        const cardsJson = await invoke('db_get_all_cards');
        const cards = JSON.parse(cardsJson);
        return cards.length > 0 ? cards : initialCards;
    } catch (error) {
        console.error('Failed to load cards from database:', error);
        return initialCards;
    }
}

// Create the store
function createCardStore() {
    const { subscribe, set, update } = writable([]);
    
    // Initialize store with database data
    loadCards().then(cards => set(cards));

    return {
        subscribe,
        
        // Reload cards from database
        reload: async () => {
            const cards = await loadCards();
            set(cards);
        },

        addCard: async (card) => {
            // Validate area exists
            const validAreas = get(areas);
            const areaExists = validAreas.some(a => a.id === card.area);
            if (!areaExists && validAreas.length > 0) {
                card.area = validAreas[0].id;
            }

            // Validate type exists (if provided)
            if (card.type) {
                const validTypes = get(types);
                const typeExists = validTypes.some(t => t.id === card.type);
                if (!typeExists) {
                    card.type = null;
                }
            }

            // Get the first column from the column store
            const firstColumn = get(columns)[0];
            const targetColumn = firstColumn ? firstColumn.id : 'inbox';
            
            // Find the highest position in the target column
            const currentCards = get({ subscribe });
            const columnCards = currentCards.filter(c => c.column === targetColumn);
            const maxPosition = columnCards.length > 0 
                ? Math.max(...columnCards.map(c => c.position || 0))
                : -1;
            
            const now = Date.now();
            const newCard = {
                id: now,
                title: card.title || 'Untitled',
                area: card.area,
                type: card.type || null,
                notes: card.notes || '',
                column: targetColumn,
                position: maxPosition + 1,
                dueDate: card.dueDate || null,
                createdAt: now,
                updatedAt: now
            };
            
            try {
                await invoke('db_insert_card', { 
                    cardJson: JSON.stringify(newCard) 
                });
                
                // Update local store
                update(cards => [...cards, newCard]);
            } catch (error) {
                console.error('Failed to add card:', error);
                throw error;
            }
        },

        updateCard: async (id, updates) => {
            // Validate area if provided
            if (updates.area !== undefined) {
                const validAreas = get(areas);
                const areaExists = validAreas.some(a => a.id === updates.area);
                if (!areaExists && validAreas.length > 0) {
                    console.warn('Invalid area, using first available area');
                    updates.area = validAreas[0].id;
                }
            }

            // Validate type if provided
            if (updates.type !== undefined && updates.type) {
                const validTypes = get(types);
                const typeExists = validTypes.some(t => t.id === updates.type);
                if (!typeExists) {
                    console.warn('Invalid type, clearing type field');
                    updates.type = null;
                }
            }

            try {
                await invoke('db_update_card', {
                    id: typeof id === 'string' ? parseInt(id) : id,
                    title: updates.title || null,
                    area: updates.area || null,
                    cardType: updates.type !== undefined ? updates.type : null,
                    notes: updates.notes !== undefined ? updates.notes : null,
                    column: updates.column || null,
                    position: updates.position !== undefined ? updates.position : null,
                    dueDate: updates.dueDate !== undefined ? updates.dueDate : null
                });
                
                // Update local store
                update(cards => cards.map(card => 
                    card.id === id ? { ...card, ...updates, updatedAt: Date.now() } : card
                ));
            } catch (error) {
                console.error('Failed to update card:', error);
                throw error;
            }
        },

        deleteCard: async (id) => {
            try {
                // Delete card attachments
                await invoke('delete_card_attachments', { 
                    cardId: id.toString() 
                });
                
                // Delete card from database
                await invoke('db_delete_card', { 
                    id: typeof id === 'string' ? parseInt(id) : id 
                });
                
                // Update local store
                update(cards => cards.filter(card => card.id !== id));
            } catch (error) {
                console.error('Failed to delete card:', error);
                throw error;
            }
        },

        deleteCardsByColumn: async (columnId) => {
            const currentCards = get({ subscribe });
            const cardsToDelete = currentCards.filter(card => card.column === columnId);
            
            try {
                // Delete each card
                for (const card of cardsToDelete) {
                    await invoke('db_delete_card', { id: card.id });
                }
                
                // Update local store
                update(cards => cards.filter(card => card.column !== columnId));
            } catch (error) {
                console.error('Failed to delete cards by column:', error);
                throw error;
            }
        },

        moveCard: async (id, newColumn, newPosition) => {
            const currentCards = get({ subscribe });
            
            // Find the card being moved
            const movedCard = currentCards.find(card => card.id === id);
            if (!movedCard) return;

            const oldColumn = movedCard.column;
            const oldPosition = movedCard.position || 0;

            // If moving within the same column
            if (oldColumn === newColumn) {
                const updated = currentCards.map(card => {
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
                
                // Update all affected cards in database in parallel
                try {
                    const cardsToUpdate = updated.filter(card =>
                        card.id === id || (card.column === newColumn && card.position !== currentCards.find(c => c.id === card.id)?.position)
                    );

                    await Promise.all(
                        cardsToUpdate.map(card =>
                            invoke('db_update_card', {
                                id: card.id,
                                title: null,
                                area: null,
                                cardType: null,
                                notes: null,
                                column: card.column,
                                position: card.position,
                                dueDate: null
                            })
                        )
                    );

                    set(updated);
                } catch (error) {
                    console.error('Failed to move card:', error);
                    throw error;
                }
                return;
            }

            // Moving to a different column
            const updated = currentCards.map(card => {
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

            // Update all affected cards in database in parallel
            try {
                const cardsToUpdate = updated.filter(card => {
                    const originalCard = currentCards.find(c => c.id === card.id);
                    return originalCard && (card.position !== originalCard.position || card.column !== originalCard.column);
                });

                await Promise.all(
                    cardsToUpdate.map(card =>
                        invoke('db_update_card', {
                            id: card.id,
                            title: null,
                            area: null,
                            cardType: null,
                            notes: null,
                            column: card.column,
                            position: card.position,
                            dueDate: null
                        })
                    )
                );

                set(updated);
            } catch (error) {
                console.error('Failed to move card:', error);
                throw error;
            }
        },

        importCards: async (newCards) => {
            const currentCards = get({ subscribe });
            
            // Group new cards by column
            const cardsByColumn = {};
            newCards.forEach(card => {
                if (!cardsByColumn[card.column]) {
                    cardsByColumn[card.column] = [];
                }
                cardsByColumn[card.column].push(card);
            });

            // Assign positions based on existing cards in each column
            const cardsWithPositions = [];
            Object.keys(cardsByColumn).forEach(columnId => {
                // Get existing cards in this column
                const existingInColumn = currentCards.filter(c => c.column === columnId);
                const maxPosition = existingInColumn.length > 0 
                    ? Math.max(...existingInColumn.map(c => c.position || 0))
                    : -1;

                // Assign positions to new cards
                cardsByColumn[columnId].forEach((card, index) => {
                    cardsWithPositions.push({
                        ...card,
                        position: maxPosition + 1 + index
                    });
                });
            });

            // Insert all cards into database
            try {
                for (const card of cardsWithPositions) {
                    await invoke('db_insert_card', { 
                        cardJson: JSON.stringify(card) 
                    });
                }
                
                // Update local store
                update(cards => [...cards, ...cardsWithPositions]);
            } catch (error) {
                console.error('Failed to import cards:', error);
                throw error;
            }
        }
    };
}

export const cards = createCardStore();
export const currentAreaFilter = writable(['all']); // Area filter - array for multi-select
export const currentTypeFilter = writable(['all']); // Type filter - array for multi-select
