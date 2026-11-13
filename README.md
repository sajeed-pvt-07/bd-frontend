# Frontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.19.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Admin analytics

Open `/admin` to sign in to the private analytics dashboard. The backend requires a separate admin account; configure both `ADMIN_USERNAME` and `ADMIN_PASSWORD` in the backend environment. Keep these secrets out of source control, use a strong password, and serve the dashboard and API over HTTPS in production. The regular `USERNAME` / `PASSWORD` account does not receive admin access unless you explicitly configure the same credentials for both.

After a successful admin sign-in, the browser remembers the Basic authentication credential in local storage for 24 hours to avoid repeated sign-ins. It is Base64-encoded, not encrypted; use this only on a trusted device/browser, keep the app protected from script injection, and sign out on shared devices. Signing out clears the remembered session immediately.

The dashboard reports anonymous visitor and session counts, per-session page visits, selected profile names on selection/greeting/timeline views, song play counts, and a full event log. It tracks Open When page visits, note opens, and journey replays as aggregate event types without recording note content. It supports all-time views, filtering, refresh, and CSV export for archiving and analysis. Analytics use a browser-local random identifier, start a new session after 30 minutes of inactivity, and record a final page-leave event when the browser page is closed where supported. IP addresses and raw user-agent strings are not stored. Events are retained in MongoDB until manually removed. On startup, the backend drops an existing TTL index on the analytics collection so it will no longer automatically delete analytics records. This does not restore events MongoDB already expired, nor does CSV replace database backups; configure regular MongoDB backups to recover from accidental deletion or database loss.

## Thank-you ending

The timeline ends with a full-screen animated wheel showing 100 thank-you phrases. The heading, message, and newline-separated phrases are managed in the database through the existing config API. Keep the `thank-you-phrases` entry populated with exactly 100 phrases; the page displays an error if it is missing or incomplete. For example:

```bash
curl -X POST "$BACKEND_URL/api/v1/config/batch" \
  -u "$USERNAME:$PASSWORD" \
  -H "Content-Type: application/json" \
  -d '[
    {"key":"thank-you-heading","value":"Thank You"},
    {"key":"thank-you-message","value":"Thank you for being part of my story."},
    {"key":"thank-you-phrases","value":"For every laugh\nFor every memory\nFor being you"}
  ]'
```

Config writes update an existing key instead of adding a duplicate; changes appear after the page refreshes its config data.

## Open-when notes

The thank-you page links to an “Open when…” note collection and a replay link back to the beginning. Notes are loaded only from the database `open-when-notes` config key; the frontend contains no note copy and shows a configuration message if the key is missing. Manage this value as a JSON array with `id`, `prompt`, `title`, and `message` fields through the existing config API. Config writes update an existing key instead of adding a duplicate.

Page transitions are subtle and follow the device’s reduced-motion preference. The greeting typing effect, celebratory confetti, and animated thank-you wheel also avoid motion when reduced motion is enabled.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
