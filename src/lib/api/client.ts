import { store } from "@/lib/store";
import type { CampusEvent, Category, CategoryInput, EventInput, EventStatus } from "@/types";

/**
 * Service layer used by every screen. Today it resolves against the mock
 * store; replacing the bodies with fetch("/api/...") calls is enough to move
 * to a real backend.
 */
const latency = (ms = 320) => new Promise((resolve) => setTimeout(resolve, ms));

export const categoriesApi = {
  async list(): Promise<Category[]> {
    await latency();
    return store.listCategories().sort((a, b) => a.name.localeCompare(b.name));
  },
  async get(id: string): Promise<Category> {
    await latency(220);
    const category = store.getCategory(id);
    if (!category) throw new Error("Category not found");
    return category;
  },
  async create(input: CategoryInput): Promise<Category> {
    await latency(420);
    if (!input.name.trim()) throw new Error("Category name is required");
    return store.createCategory(input);
  },
  async update(id: string, patch: Partial<CategoryInput>): Promise<Category> {
    await latency(420);
    const updated = store.updateCategory(id, patch);
    if (!updated) throw new Error("Category not found");
    return updated;
  },
  async setActive(id: string, active: boolean): Promise<Category> {
    return categoriesApi.update(id, { active });
  },
};

export const eventsApi = {
  async list(): Promise<CampusEvent[]> {
    await latency();
    return store.listEvents().sort((a, b) => a.date.localeCompare(b.date));
  },
  async listPublished(): Promise<CampusEvent[]> {
    const events = await eventsApi.list();
    const activeCategoryIds = new Set(
      store
        .listCategories()
        .filter((c) => c.active)
        .map((c) => c.id),
    );
    return events.filter((e) => e.status === "published" && activeCategoryIds.has(e.categoryId));
  },
  async get(id: string): Promise<CampusEvent> {
    await latency(220);
    const event = store.getEvent(id);
    if (!event) throw new Error("Event not found");
    return event;
  },
  async create(input: EventInput): Promise<CampusEvent> {
    await latency(480);
    return store.createEvent(input);
  },
  async update(id: string, patch: Partial<EventInput>): Promise<CampusEvent> {
    await latency(480);
    const updated = store.updateEvent(id, patch);
    if (!updated) throw new Error("Event not found");
    return updated;
  },
  async setStatus(id: string, status: EventStatus): Promise<CampusEvent> {
    return eventsApi.update(id, { status });
  },
};

export interface AdminSession {
  email: string;
  name: string;
  token: string;
}

const SESSION_KEY = "ces-admin-session";
const DEMO_EMAIL = "admin@college.edu";
const DEMO_PASSWORD = "admin123";

export const authApi = {
  demoCredentials: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  async login(email: string, password: string): Promise<AdminSession> {
    await latency(600);
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw new Error("Invalid email or password.");
    }
    const session: AdminSession = {
      email: DEMO_EMAIL,
      name: "Events Administrator",
      token: "mock-token",
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return session;
  },
  logout() {
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  },
  getSession(): AdminSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AdminSession) : null;
    } catch {
      return null;
    }
  },
};