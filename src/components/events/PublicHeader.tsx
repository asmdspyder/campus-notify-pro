import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/events" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="size-4.5" />
          </span>
          <span className="text-sm font-semibold sm:text-base">Northfield College</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            to="/events"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Events
          </Link>
          <a
            href="/events#categories"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Categories
          </a>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-medium text-foreground">Northfield College — Campus Events</p>
        <p className="mt-1">Published by the Office of Student Affairs.</p>
      </div>
    </footer>
  );
}