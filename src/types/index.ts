export type EventStatus = "draft" | "published" | "disabled";

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string | undefined;
  icon?: string | undefined;
  active: boolean;
  createdAt: string;
}

export interface CampusEvent {
  id: string;
  name: string;
  categoryId: string;
  organizer: string;
  poster?: string | undefined;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venueName: string;
  venueDetails?: string | undefined;
  registrationRequired: boolean;
  registrationStart?: string | undefined;
  registrationEnd?: string | undefined;
  formUrl?: string | undefined;
  maxParticipants?: number | undefined;
  shortDescription: string;
  fullDescription: string;
  eligibility?: string | undefined;
  contactPerson?: string | undefined;
  contactEmail?: string | undefined;
  contactPhone?: string | undefined;
  instructions?: string | undefined;
  status: EventStatus;
  createdAt: string;
}

export type CategoryInput = Omit<Category, "id" | "createdAt">;
export type EventInput = Omit<CampusEvent, "id" | "createdAt">;

export type RegistrationState =
  | { kind: "not-required"; label: string }
  | { kind: "open"; label: string }
  | { kind: "upcoming"; label: string }
  | { kind: "closed"; label: string };