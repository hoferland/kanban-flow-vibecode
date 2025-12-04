/**
 * Card Model
 * Represents a single Kanban card
 */

export class Card {
  constructor({
    id = Date.now(),
    title,
    area,
    type = '',
    notes = '',
    column = 'inbox',
    position = 0,
    createdAt = Date.now(),
    updatedAt = Date.now()
  }) {
    this.id = id;
    this.title = title;
    this.area = area;
    this.type = type;
    this.notes = notes;
    this.column = column;
    this.position = position;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validate card data
   */
  validate() {
    if (!this.title || this.title.trim() === '') {
      throw new Error('Card title is required');
    }
    
    if (!this.area) {
      throw new Error('Card area is required');
    }

    return true;
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      area: this.area,
      type: this.type,
      notes: this.notes,
      column: this.column,
      position: this.position,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create from plain object
   */
  static fromJSON(data) {
    return new Card(data);
  }
}
