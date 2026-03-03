const { widget } = figma;
const { useSyncedState, usePropertyMenu, AutoLayout, Text } = widget;

import { Card, Column, Area, CardType, DEFAULT_COLUMNS, DEFAULT_AREAS, DEFAULT_TYPES, TYPE_ICONS } from './types';

// Widget component
function FlowKanbanWidget() {
  // Synced state persisted in Figma document
  const [serverHost, setServerHost] = useSyncedState<string>('serverHost', 'localhost');
  const [serverPort, setServerPort] = useSyncedState<number>('serverPort', 9899);
  const [cards, setCards] = useSyncedState<Card[]>('cards', []);
  const [columns, setColumns] = useSyncedState<Column[]>('columns', DEFAULT_COLUMNS);
  const [areas, setAreas] = useSyncedState<Area[]>('areas', DEFAULT_AREAS);
  const [types, setTypes] = useSyncedState<CardType[]>('types', DEFAULT_TYPES);
  const [connected, setConnected] = useSyncedState<boolean>('connected', false);
  const [lastSyncedAt, setLastSyncedAt] = useSyncedState<number | null>('lastSyncedAt', null);
  const [syncError, setSyncError] = useSyncedState<string | null>('syncError', null);

  // Fetch data from Flow server
  const fetchData = function(): Promise<void> {
    const baseUrl = 'http://' + serverHost + ':' + serverPort;

    return new Promise<void>(function(resolve) {
      fetch(baseUrl + '/api/health')
        .then(function(healthRes) {
          if (!healthRes.ok) throw new Error('Server not responding');
          return Promise.all([
            fetch(baseUrl + '/api/cards'),
            fetch(baseUrl + '/api/columns'),
            fetch(baseUrl + '/api/attributes?type=area'),
            fetch(baseUrl + '/api/attributes?type=type'),
          ]);
        })
        .then(function(responses) {
          const promises: Promise<any>[] = [];
          if (responses[0].ok) promises.push(responses[0].json().then(function(d) { setCards(d); }));
          if (responses[1].ok) promises.push(responses[1].json().then(function(d) { setColumns(d); }));
          if (responses[2].ok) promises.push(responses[2].json().then(function(d) { setAreas(d); }));
          if (responses[3].ok) promises.push(responses[3].json().then(function(d) { setTypes(d); }));
          return Promise.all(promises);
        })
        .then(function() {
          setConnected(true);
          setLastSyncedAt(Date.now());
          setSyncError(null);
          resolve();
        })
        .catch(function(error) {
          setConnected(false);
          setSyncError(error instanceof Error ? error.message : 'Connection failed');
          resolve();
        });
    });
  };

  // Create a new card via API
  const createCardOnServer = function(title: string, areaId: string, cardType: string | null): Promise<void> {
    const baseUrl = 'http://' + serverHost + ':' + serverPort;
    const body: any = { title: title, area: areaId };
    if (cardType) body.type = cardType;

    return fetch(baseUrl + '/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    .then(function(response) {
      if (response.ok) {
        return response.json().then(function(newCard) {
          setCards(cards.concat([newCard]));
        });
      }
    })
    .catch(function(error) {
      console.error('Failed to create card:', error);
    });
  };

  // Update a card via API
  const updateCardOnServer = function(id: number, updates: any): Promise<void> {
    const baseUrl = 'http://' + serverHost + ':' + serverPort;

    return fetch(baseUrl + '/api/cards/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    .then(function(response) {
      if (response.ok) {
        return response.json().then(function(updatedCard) {
          setCards(cards.map(function(c) {
            if (c.id === id) {
              return updatedCard;
            }
            return c;
          }));
        });
      }
    })
    .catch(function(error) {
      console.error('Failed to update card:', error);
    });
  };

  // Delete a card via API
  const deleteCardOnServer = function(id: number): Promise<void> {
    const baseUrl = 'http://' + serverHost + ':' + serverPort;

    return fetch(baseUrl + '/api/cards/' + id, {
      method: 'DELETE',
    })
    .then(function(response) {
      if (response.ok) {
        setCards(cards.filter(function(c) { return c.id !== id; }));
      }
    })
    .catch(function(error) {
      console.error('Failed to delete card:', error);
    });
  };

  // Get area color
  const getAreaColor = function(areaId: string): string {
    const area = areas.find(function(a) { return a.id === areaId; });
    return area && area.color ? area.color : '#e8e4db';
  };

  // Get type icon
  const getTypeIcon = function(typeId: string | null): string {
    if (!typeId) return '';
    return TYPE_ICONS[typeId] || '';
  };

  // Group cards by column
  const cardsByColumn: Record<string, Card[]> = {};
  columns.forEach(function(col) {
    cardsByColumn[col.id] = cards
      .filter(function(c) { return c.column === col.id; })
      .sort(function(a, b) { return a.position - b.position; });
  });

  // Show create card UI
  const showCreateCardUI = function(): Promise<void> {
    return new Promise<void>(function(resolve) {
      figma.showUI(__html__, { width: 300, height: 280 });
      figma.ui.postMessage({ type: 'create-card', areas: areas, types: types });

      figma.ui.onmessage = function(msg) {
        if (msg.type === 'create-card-submit') {
          createCardOnServer(msg.title, msg.area, msg.cardType).then(function() {
            figma.closePlugin();
            resolve();
          });
        } else if (msg.type === 'close') {
          figma.closePlugin();
          resolve();
        }
      };
    });
  };

  // Show edit card UI
  const showEditCardUI = function(card: Card): Promise<void> {
    return new Promise<void>(function(resolve) {
      figma.showUI(__html__, { width: 300, height: 380 });
      figma.ui.postMessage({
        type: 'edit-card',
        card: card,
        areas: areas,
        types: types,
        columns: columns.filter(function(c) { return c.isActive; })
      });

      figma.ui.onmessage = function(msg) {
        if (msg.type === 'edit-card-submit') {
          const updates: any = {
            title: msg.title,
            area: msg.area,
            column: msg.column,
            notes: msg.notes
          };
          if (msg.cardType) {
            updates.type = msg.cardType;
          }
          updateCardOnServer(msg.id, updates).then(function() {
            figma.closePlugin();
            resolve();
          });
        } else if (msg.type === 'delete-card') {
          deleteCardOnServer(msg.id).then(function() {
            figma.closePlugin();
            resolve();
          });
        } else if (msg.type === 'close') {
          figma.closePlugin();
          resolve();
        }
      };
    });
  };

  // Property menu for widget actions
  usePropertyMenu(
    [
      { itemType: 'action', propertyName: 'sync', tooltip: 'Sync with Flow' },
      { itemType: 'action', propertyName: 'addCard', tooltip: 'Add New Card' },
    ],
    function(event) {
      if (event.propertyName === 'sync') {
        return fetchData();
      }
      if (event.propertyName === 'addCard') {
        return showCreateCardUI();
      }
    }
  );

  return (
    <AutoLayout
      direction="vertical"
      spacing={12}
      padding={16}
      cornerRadius={8}
      fill="#ffffff"
      stroke="#e0e0e0"
      strokeWidth={1}
    >
      {/* Header */}
      <AutoLayout direction="horizontal" spacing={8} verticalAlignItems="center" width="fill-parent">
        <Text fontSize={18} fontWeight="bold" fill="#333333">
          Flow Kanban
        </Text>
        <AutoLayout horizontalAlignItems="end" width="fill-parent">
          <AutoLayout
            direction="horizontal"
            spacing={4}
            verticalAlignItems="center"
            padding={{ horizontal: 8, vertical: 4 }}
            cornerRadius={4}
            fill={connected ? '#d4edda' : '#f8d7da'}
            onClick={function() { return fetchData(); }}
          >
            <Text fontSize={10} fill={connected ? '#155724' : '#721c24'}>
              {connected ? '● Connected' : '○ Disconnected'}
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>

      {/* Sync info */}
      {lastSyncedAt && (
        <Text fontSize={10} fill="#888888">
          Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}
        </Text>
      )}
      {syncError && (
        <Text fontSize={10} fill="#dc3545">
          Error: {syncError}
        </Text>
      )}

      {/* Board */}
      <AutoLayout direction="horizontal" spacing={12}>
        {columns.filter(function(col) { return col.isActive; }).map(function(column) {
          return (
            <AutoLayout
              key={column.id}
              direction="vertical"
              spacing={8}
              padding={8}
              cornerRadius={6}
              fill="#f8f9fa"
              width={180}
            >
              {/* Column header */}
              <AutoLayout direction="horizontal" spacing={4} verticalAlignItems="center">
                <Text fontSize={12} fontWeight="bold" fill="#333333">
                  {column.label}
                </Text>
                {column.wipLimit && (
                  <Text fontSize={10} fill="#888888">
                    ({cardsByColumn[column.id] ? cardsByColumn[column.id].length : 0}/{column.wipLimit})
                  </Text>
                )}
              </AutoLayout>

              {/* Cards */}
              {cardsByColumn[column.id] && cardsByColumn[column.id].map(function(card) {
                return (
                  <AutoLayout
                    key={card.id}
                    direction="vertical"
                    spacing={4}
                    padding={8}
                    cornerRadius={4}
                    fill="#ffffff"
                    stroke="#e0e0e0"
                    strokeWidth={1}
                    width="fill-parent"
                    onClick={function() {
                      return showEditCardUI(card);
                    }}
                    hoverStyle={{ fill: '#f8f9fa' }}
                  >
                    <AutoLayout direction="horizontal" spacing={4} verticalAlignItems="center">
                      {card.type && (
                        <Text fontSize={10} fill="#666666">
                          {getTypeIcon(card.type)}
                        </Text>
                      )}
                      <Text fontSize={11} fill="#333333" width="fill-parent">
                        {card.title}
                      </Text>
                    </AutoLayout>
                    <AutoLayout
                      padding={{ horizontal: 4, vertical: 2 }}
                      cornerRadius={2}
                      fill={getAreaColor(card.area)}
                    >
                      <Text fontSize={9} fill="#333333">
                        {(function() {
                          const a = areas.find(function(ar) { return ar.id === card.area; });
                          return a ? a.label : card.area;
                        })()}
                      </Text>
                    </AutoLayout>
                  </AutoLayout>
                );
              })}

              {/* Add card button (only in inbox) */}
              {column.id === 'inbox' && (
                <AutoLayout
                  direction="horizontal"
                  spacing={4}
                  padding={8}
                  cornerRadius={4}
                  fill="#e9ecef"
                  width="fill-parent"
                  horizontalAlignItems="center"
                  onClick={function() {
                    return showCreateCardUI();
                  }}
                  hoverStyle={{ fill: '#dee2e6' }}
                >
                  <Text fontSize={11} fill="#666666">
                    + Add Card
                  </Text>
                </AutoLayout>
              )}
            </AutoLayout>
          );
        })}
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(FlowKanbanWidget);
