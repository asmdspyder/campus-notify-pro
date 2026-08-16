# Campus Connect

Build a complete College Event Notification System as a modern Next.js + TypeScript + Tailwind CSS application using the Next.js App Router.

The project must contain both the frontend and backend/API structure in the same Next.js application. For now, use mock/in-memory data only. Do not add any database, Firebase, Supabase, Prisma, external authentication, or storage.

1. Application Areas

Create two separate experiences:

Admin Portal

Routes:

- "/admin/login"

- "/admin/dashboard"

- "/admin/categories"

- "/admin/categories/[id]"

- "/admin/events"

- "/admin/events/create"

- "/admin/events/[id]/edit"

Public Student Website

Routes:

- "/events"

- "/events/[id]"

Students do not need an account.

---

2. Admin Login

Create a clean, premium login page with:

- College logo/name

- Email

- Password

- Show/hide password

- Sign In button

- Validation and error states

Use mock authentication for now.

After login, redirect to "/admin/dashboard".

---

3. Admin Dashboard

Create a modern SaaS-style dashboard with a sidebar.

Sidebar:

- Dashboard

- Categories

- Events

- Logout

Dashboard should show:

- Total Categories

- Active Categories

- Total Events

- Published Events

- Upcoming Events

Also show an Upcoming Events table with:

- Event

- Category

- Date

- Venue

- Registration status

- Event status

- Actions

Include prominent:

- "Create Category"

- "Create Event"

buttons.

---

4. Category Management

Create "/admin/categories".

Admin can:

- Create category

- Edit category

- Enable/disable category

- View events inside category

Category fields:

- Name

- Description

- Optional image/icon

- Active/Disabled status

Display categories in a clean table/card layout with:

- Name

- Number of events

- Status

- Actions

Use confirmation dialogs for disabling.

---

5. Event Management

Create "/admin/events".

Admin can:

- Create

- Edit

- View

- Publish

- Disable

- Search

- Filter

Event fields:

Basic

- Event name

- Category

- Organizer/Department

Poster

- Image upload

- Image preview

- Replace/remove image

Schedule

- Event date

- Start time

- End time

Venue

- Venue name

- Venue details

Registration

- Registration required: Yes/No

- Registration start date

- Registration end date

- Google Form URL

- Maximum participants (optional)

Content

- Short description

- Full event description

Optional

- Eligibility

- Contact person

- Contact email

- Contact phone

- Additional instructions

Event status:

- Draft

- Published

- Disabled

Organize the creation form into clear sections instead of one large form.

Buttons:

- Save Draft

- Publish Event

- Cancel

---

6. Public Events Website

Create a completely separate, attractive student-facing design at "/events".

Header:

- College logo/name

- Events

- Categories

Hero:

Discover What's Happening on Campus

Add:

- Search events

- Category filters

Display upcoming published events as beautiful responsive cards containing:

- Poster

- Category

- Event name

- Short description

- Date

- Time

- Venue

- Registration status

- View Event

Use a 3-column desktop grid, 2-column tablet grid, and 1-column mobile layout.

---

7. Public Event Details

Create "/events/[id]".

Display:

- Large event poster

- Category

- Event name

- Description

- Date

- Time

- Venue

- Organizer

- Eligibility

- Contact information

- Registration information

Registration button behavior:

- Registration open → "Register Now"

- Registration not started → show opening date

- Registration closed → "Registration Closed"

- Registration not required → "No Registration Required"

When "Register Now" is clicked, open the event's Google Form URL in a new tab.

---

8. UI / Design

The design must be:

Modern, clean, minimalist, premium, professional, and easy to use.

Use:

- White/light neutral backgrounds

- Dark typography

- One configurable primary brand color

- Subtle borders

- Soft shadows

- Generous whitespace

- Clean typography such as Geist or Inter

- Professional status badges

- Minimal animations

Avoid:

- Excessive gradients

- Excessive rounded cards

- Too many colors

- Clutter

- Large unnecessary graphics

- Excessive animations

The public website should feel like a polished modern college event platform, while the admin portal should feel like a professional SaaS dashboard.

---

9. Responsive Design

The entire application must work perfectly on:

- Desktop

- Tablet

- Mobile

Admin sidebar should become a mobile drawer.

Forms should stack properly on mobile.

Tables should become cards or responsive layouts where necessary.

The student website should be mobile-first.

---

10. Mock Backend/API

Create Next.js Route Handlers so the project is structured as a full-stack application.

Use:

/api/auth

/api/categories

/api/events

Support mock:

GET

POST

PUT

PATCH

for categories and events.

Frontend should communicate through an API/service layer rather than directly depending on hardcoded data.

Suggested structure:

app/

  admin/

  events/

  api/

    auth/

    categories/

    events/

components/

  admin/

  events/

  ui/

lib/

  api/

  mock-data/

types/

Do not implement database persistence yet.

---

11. UX Requirements

Include:

- Loading states

- Skeletons

- Empty states

- Error states

- Toast notifications

- Form validation

- Confirmation dialogs

- Search

- Filtering

- Responsive navigation

There must be no dead buttons for core functionality.

Creating/editing/disabling mock categories and events should immediately update the UI.

---

12. Sample Data

Include realistic mock categories and events such as:

- Technical

- Cultural

- Sports

- Workshops

- Seminars

- Competitions

Sample events:

- AI Workshop 2026

- Annual Sports Meet

- Coding Competition

- Cultural Fest

- Entrepreneurship Summit

- Cybersecurity Guest Lecture

Make the mock data realistic enough to demonstrate the complete application.

Final Goal

Build the complete UI and working frontend experience now.

The application should allow:

Admin → Login → Dashboard → Category → Create Event → Publish → Public Event Website → Student Views Event → Register via Google Form

Use mock data for now, but structure the code so a real database and authentication system can be added later without redesigning the application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://campus-notify-pro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee67316e-2ab7-4b05-af15-5a63ff8f0a79).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
