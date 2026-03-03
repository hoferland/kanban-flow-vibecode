import { Card, Column, Attribute, Area, CardType } from '../types';

export interface ApiConfig {
  host: string;
  port: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

const DEFAULT_CONFIG: ApiConfig = {
  host: 'localhost',
  port: 9899,
};

function getBaseUrl(config: ApiConfig = DEFAULT_CONFIG): string {
  return `http://${config.host}:${config.port}`;
}

// Health check
export async function checkHealth(config?: ApiConfig): Promise<ApiResponse<{ status: string; version: string }>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/health`);
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Connection failed' };
  }
}

// Cards
export async function getCards(config?: ApiConfig): Promise<ApiResponse<Card[]>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/cards`);
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch cards' };
  }
}

export async function getCard(id: number, config?: ApiConfig): Promise<ApiResponse<Card>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/cards/${id}`);
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch card' };
  }
}

export interface CreateCardParams {
  title: string;
  area: string;
  type?: string;
  notes?: string;
}

export async function createCard(params: CreateCardParams, config?: ApiConfig): Promise<ApiResponse<Card>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to create card' };
  }
}

export interface UpdateCardParams {
  title?: string;
  area?: string;
  type?: string;
  notes?: string;
  column?: string;
  position?: number;
  dueDate?: number;
}

export async function updateCard(id: number, params: UpdateCardParams, config?: ApiConfig): Promise<ApiResponse<Card>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to update card' };
  }
}

export async function deleteCard(id: number, config?: ApiConfig): Promise<ApiResponse<{ deleted: number }>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/cards/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to delete card' };
  }
}

// Columns
export async function getColumns(config?: ApiConfig): Promise<ApiResponse<Column[]>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/columns`);
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch columns' };
  }
}

// Attributes (areas and types)
export async function getAreas(config?: ApiConfig): Promise<ApiResponse<Area[]>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/attributes?type=area`);
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch areas' };
  }
}

export async function getCardTypes(config?: ApiConfig): Promise<ApiResponse<CardType[]>> {
  try {
    const response = await fetch(`${getBaseUrl(config)}/api/attributes?type=type`);
    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch card types' };
  }
}

// Fetch all data at once
export interface AllData {
  cards: Card[];
  columns: Column[];
  areas: Area[];
  types: CardType[];
}

export async function fetchAllData(config?: ApiConfig): Promise<ApiResponse<AllData>> {
  try {
    const [cardsRes, columnsRes, areasRes, typesRes] = await Promise.all([
      getCards(config),
      getColumns(config),
      getAreas(config),
      getCardTypes(config),
    ]);

    if (cardsRes.error) return { data: null, error: cardsRes.error };
    if (columnsRes.error) return { data: null, error: columnsRes.error };
    if (areasRes.error) return { data: null, error: areasRes.error };
    if (typesRes.error) return { data: null, error: typesRes.error };

    return {
      data: {
        cards: cardsRes.data!,
        columns: columnsRes.data!,
        areas: areasRes.data!,
        types: typesRes.data!,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch data' };
  }
}
