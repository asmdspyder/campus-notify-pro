import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CampusEvent, Category, EventInput, EventStatus } from "@/types";

type Errors = Partial<Record<string, string>>;

const emptyEvent: EventInput = {
  name: "",
  categoryId: "",
  organizer: "",
  poster: undefined,
  date: "",
  startTime: "09:00",
  endTime: "17:00",
  venueName: "",
  venueDetails: "",
  registrationRequired: true,
  registrationStart: "",
  registrationEnd: "",
  formUrl: "",
  maxParticipants: undefined,
  shortDescription: "",
  fullDescription: "",
  eligibility: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
  instructions: "",
  status: "draft",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-background p-5 shadow-soft sm:p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  error,
  full,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  full?: boolean | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label htmlFor={htmlFor} className="mb-1.5 text-xs font-medium">
        {label}
      </Label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
      {!error && hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function EventForm({
  categories,
  initialEvent,
  submitting,
  onSubmit,
  onCancel,
}: {
  categories: Category[];
  initialEvent?: CampusEvent;
  submitting: boolean;
  onSubmit: (values: EventInput, status: EventStatus) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<EventInput>(() =>
    initialEvent ? { ...emptyEvent, ...initialEvent } : emptyEvent,
  );
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key as string]: undefined }));
  };

  const validate = (status: EventStatus): boolean => {
    const next: Errors = {};
    if (!values.name.trim()) next["name"] = "Event name is required.";
    if (!values.categoryId) next["categoryId"] = "Select a category.";
    if (!values.organizer.trim()) next["organizer"] = "Organizer is required.";
    if (!values.date) next["date"] = "Event date is required.";
    if (!values.venueName.trim()) next["venueName"] = "Venue name is required.";
    if (values.startTime && values.endTime && values.endTime <= values.startTime) {
      next["endTime"] = "End time must be after the start time.";
    }
    if (!values.shortDescription.trim()) next["shortDescription"] = "Short description is required.";
    if (values.shortDescription.length > 200) {
      next["shortDescription"] = "Keep the short description under 200 characters.";
    }
    if (status === "published" && !values.fullDescription.trim()) {
      next["fullDescription"] = "A full description is required before publishing.";
    }
    if (values.registrationRequired) {
      if (
        values.registrationStart &&
        values.registrationEnd &&
        values.registrationEnd < values.registrationStart
      ) {
        next["registrationEnd"] = "Registration must close after it opens.";
      }
      if (status === "published" && !values.formUrl?.trim()) {
        next["formUrl"] = "A Google Form URL is required when registration is on.";
      }
      if (values.formUrl && !/^https?:\/\//i.test(values.formUrl.trim())) {
        next["formUrl"] = "Enter a valid URL starting with https://";
      }
    }
    if (values.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
      next["contactEmail"] = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (status: EventStatus) => {
    if (!validate(status)) return;
    onSubmit({ ...values, status }, status);
  };

  const onPosterChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 3_000_000) {
      setErrors((prev) => ({ ...prev, poster: "Image must be smaller than 3 MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("poster", String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <form
      className="space-y-5 pb-24"
      onSubmit={(e) => {
        e.preventDefault();
        submit(values.status === "published" ? "published" : "draft");
      }}
    >
      <Section title="Basic details" description="What the event is and who is running it.">
        <Field label="Event name" htmlFor="name" error={errors["name"]} full>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="AI Workshop 2026"
          />
        </Field>
        <Field label="Category" htmlFor="category" error={errors["categoryId"]}>
          <Select value={values.categoryId} onValueChange={(v) => set("categoryId", v)}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} disabled={!c.active}>
                  {c.name}
                  {c.active ? "" : " (disabled)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Organizer / department" htmlFor="organizer" error={errors["organizer"]}>
          <Input
            id="organizer"
            value={values.organizer}
            onChange={(e) => set("organizer", e.target.value)}
            placeholder="Department of Computer Science"
          />
        </Field>
      </Section>

      <Section title="Poster" description="Shown on the student website. Landscape works best.">
        <div className="sm:col-span-2">
          {values.poster ? (
            <div className="space-y-3">
              <img
                src={values.poster}
                alt="Event poster preview"
                className="aspect-[16/9] w-full max-w-md rounded-md border border-border object-cover"
              />
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm" type="button">
                  <label className="cursor-pointer">
                    Replace image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPosterChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="text-destructive"
                  onClick={() => set("poster", undefined)}
                >
                  <Trash2 className="size-4" /> Remove
                </Button>
              </div>
            </div>
          ) : (
            <label className="flex aspect-[16/9] w-full max-w-md cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
              <ImagePlus className="size-6" />
              Upload poster image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPosterChange(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
          {errors["poster"] ? (
            <p className="mt-2 text-xs text-destructive">{errors["poster"]}</p>
          ) : null}
        </div>
      </Section>

      <Section title="Schedule" description="When the event takes place.">
        <Field label="Event date" htmlFor="date" error={errors["date"]}>
          <Input
            id="date"
            type="date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start time" htmlFor="startTime" error={errors["startTime"]}>
            <Input
              id="startTime"
              type="time"
              value={values.startTime}
              onChange={(e) => set("startTime", e.target.value)}
            />
          </Field>
          <Field label="End time" htmlFor="endTime" error={errors["endTime"]}>
            <Input
              id="endTime"
              type="time"
              value={values.endTime}
              onChange={(e) => set("endTime", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Venue" description="Where students should go.">
        <Field label="Venue name" htmlFor="venueName" error={errors["venueName"]}>
          <Input
            id="venueName"
            value={values.venueName}
            onChange={(e) => set("venueName", e.target.value)}
            placeholder="Seminar Hall B"
          />
        </Field>
        <Field label="Venue details" htmlFor="venueDetails" hint="Optional directions or landmarks.">
          <Input
            id="venueDetails"
            value={values.venueDetails ?? ""}
            onChange={(e) => set("venueDetails", e.target.value)}
            placeholder="Academic Block A, first floor"
          />
        </Field>
      </Section>

      <Section title="Registration" description="Control how students sign up.">
        <div className="flex items-center justify-between rounded-md border border-border px-4 py-3 sm:col-span-2">
          <div>
            <p className="text-sm font-medium">Registration required</p>
            <p className="text-xs text-muted-foreground">
              Turn off for open-to-all events like fests.
            </p>
          </div>
          <Switch
            checked={values.registrationRequired}
            onCheckedChange={(v) => set("registrationRequired", v)}
            aria-label="Registration required"
          />
        </div>
        {values.registrationRequired ? (
          <>
            <Field label="Registration opens" htmlFor="regStart">
              <Input
                id="regStart"
                type="date"
                value={values.registrationStart ?? ""}
                onChange={(e) => set("registrationStart", e.target.value)}
              />
            </Field>
            <Field label="Registration closes" htmlFor="regEnd" error={errors["registrationEnd"]}>
              <Input
                id="regEnd"
                type="date"
                value={values.registrationEnd ?? ""}
                onChange={(e) => set("registrationEnd", e.target.value)}
              />
            </Field>
            <Field label="Google Form URL" htmlFor="formUrl" error={errors["formUrl"]} full>
              <Input
                id="formUrl"
                value={values.formUrl ?? ""}
                onChange={(e) => set("formUrl", e.target.value)}
                placeholder="https://docs.google.com/forms/..."
              />
            </Field>
            <Field label="Maximum participants" htmlFor="maxParticipants" hint="Optional.">
              <Input
                id="maxParticipants"
                type="number"
                min={1}
                value={values.maxParticipants ?? ""}
                onChange={(e) =>
                  set("maxParticipants", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </Field>
          </>
        ) : null}
      </Section>

      <Section title="Content" description="What students will read.">
        <Field
          label="Short description"
          htmlFor="shortDescription"
          error={errors["shortDescription"]}
          hint={`${values.shortDescription.length}/200 characters — shown on event cards.`}
          full
        >
          <Textarea
            id="shortDescription"
            rows={2}
            maxLength={220}
            value={values.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
          />
        </Field>
        <Field
          label="Full description"
          htmlFor="fullDescription"
          error={errors["fullDescription"]}
          full
        >
          <Textarea
            id="fullDescription"
            rows={7}
            value={values.fullDescription}
            onChange={(e) => set("fullDescription", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Additional information" description="All optional.">
        <Field label="Eligibility" htmlFor="eligibility" full>
          <Input
            id="eligibility"
            value={values.eligibility ?? ""}
            onChange={(e) => set("eligibility", e.target.value)}
            placeholder="Open to all second and third year students"
          />
        </Field>
        <Field label="Contact person" htmlFor="contactPerson">
          <Input
            id="contactPerson"
            value={values.contactPerson ?? ""}
            onChange={(e) => set("contactPerson", e.target.value)}
          />
        </Field>
        <Field label="Contact email" htmlFor="contactEmail" error={errors["contactEmail"]}>
          <Input
            id="contactEmail"
            type="email"
            value={values.contactEmail ?? ""}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </Field>
        <Field label="Contact phone" htmlFor="contactPhone">
          <Input
            id="contactPhone"
            value={values.contactPhone ?? ""}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </Field>
        <Field label="Additional instructions" htmlFor="instructions" full>
          <Textarea
            id="instructions"
            rows={3}
            value={values.instructions ?? ""}
            onChange={(e) => set("instructions", e.target.value)}
          />
        </Field>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:pl-72">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => submit("draft")}
          disabled={submitting}
        >
          Save draft
        </Button>
        <Button type="button" onClick={() => submit("published")} disabled={submitting}>
          {submitting ? "Saving…" : "Publish event"}
        </Button>
      </div>
    </form>
  );
}