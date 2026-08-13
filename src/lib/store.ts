import type { CampusEvent, Category, CategoryInput, EventInput } from "@/types";
import { mockCategories, mockEvents } from "@/lib/mock-data";

/**
 * In-memory mock persistence layer.
 * Swap this module for real database calls later; the API surface below is
 * the only thing the service layer depends on.
 */
const STORAGE_KEY = "ces-mock-db-v1";

type Db = { categories: Category[]; events: CampusEvent[] };

let db: Db | null = null;

function seed(): Db {
  return {
    categories: mockCategories.map((c) => ({ ...c })),
    events: mockEvents.map((e) => ({ ...e })),
  };
}

function load(): Db {
  if (db) return db;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        db = JSON.parse(raw) as Db;
        return db;
      }
    } catch {
      /* ignore corrupt cache */
    }
  }
  db = seed();
  return db;
}

function persist() {
  if (typeof window === "undefined" || !db) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage may be unavailable */
  }
}

const id = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

export const store = {
  listCategories(): Category[] {
    return load().categories.map((c) => ({ ...c }));
  },
  getCategory(categoryId: string): Category | undefined {
    const found = load().categories.find((c) => c.id === categoryId);
    return found ? { ...found } : undefined;
  },
  createCategory(input: CategoryInput): Category {
    const created: Category = { ...input, id: id("cat"), createdAt: new Date().toISOString() };
    load().categories.unshift(created);
    persist();
    return { ...created };
  },
  updateCategory(categoryId: string, patch: Partial<CategoryInput>): Category | undefined {
    const data = load();
    const index = data.categories.findIndex((c) => c.id === categoryId);
    if (index === -1) return undefined;
    const existing = data.categories[index]!;
    const next = { ...existing, ...patch };
    data.categories[index] = next;
    persist();
    return { ...next };
  },
  listEvents(): CampusEvent[] {
    return load().events.map((e) => ({ ...e }));
  },
  getEvent(eventId: string): CampusEvent | undefined {
    const found = load().events.find((e) => e.id === eventId);
    return found ? { ...found } : undefined;
  },
  createEvent(input: EventInput): CampusEvent {
    const created: CampusEvent = { ...input, id: id("evt"), createdAt: new Date().toISOString() };
    load().events.unshift(created);
    persist();
    return { ...created };
  },
  updateEvent(eventId: string, patch: Partial<EventInput>): CampusEvent | undefined {
    const data = load();
    const index = data.events.findIndex((e) => e.id === eventId);
    if (index === -1) return undefined;
    const existing = data.events[index]!;
    const next = { ...existing, ...patch };
    data.events[index] = next;
    persist();
    return { ...next };
  },
  reset() {
    db = seed();
    persist();
  },
};