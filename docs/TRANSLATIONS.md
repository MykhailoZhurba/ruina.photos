# Languages and dark mode

The site is published in English, Latvian, Russian and Ukrainian, with a light and a
dark theme.

## URLs

| Language  | Home   | Example page                  |
| --------- | ------ | ----------------------------- |
| English   | `/`    | `/collections/automotive/`    |
| Latvian   | `/lv/` | `/lv/collections/automotive/` |
| Russian   | `/ru/` | `/ru/collections/automotive/` |
| Ukrainian | `/uk/` | `/uk/collections/automotive/` |

Every language version is a real, prerendered page, and each links to the others with
`hreflang` tags (and in the sitemap), so search engines index all four. `uk` is the
ISO code for Ukrainian; the switcher shows it as **UA**.

`/admin` exists only in English.

## Where the text lives

| What                                                    | File                                           |
| ------------------------------------------------------- | ---------------------------------------------- |
| Buttons, labels, booking form, footer, photo viewer     | `src/i18n/ui.ts`                               |
| Page titles and descriptions, headings, category intros | `src/i18n/seo.ts` (English: `site.config.mts`) |
| The visitor's booking auto-reply email                  | `src/i18n/email.ts`                            |
| About page bio                                          | `src/content/about.md`, `about.lv.md`, …       |
| Privacy notice                                          | `src/content/privacy.md`, `privacy.lv.md`, …   |

To change a phrase, edit it in the right language's block. English is the source:
every other language must have exactly the same keys, and the build fails (TypeScript)
if one is missing.

`npm test` also checks every language for:

- empty strings;
- `{placeholders}` added or dropped compared with English (e.g. `{owner}`);
- search titles over 65 characters or descriptions over 165;
- a gallery category missing its wording.

The owner's name stays in Latin script in every language, matching the brand and the
social handles.

## The booking form in other languages

- Labels, errors and the confirmation message follow the page's language. The server
  returns a stable `code` for each outcome, and the page shows its translation.
- The shoot type **values** stay in English (`site.config.mts → shootTypes`), because
  the server validates them and your notification email uses them. Only the labels a
  visitor sees are translated (`shoot.*` in `ui.ts`). A new shoot type needs its label
  added in each language, or it shows in English.
- The visitor's **auto-reply** is sent in the language they booked in. Your
  notification stays in English and includes a **Language** line, so you know which
  language to reply in.

## Adding a language

1. Add its code to `LOCALES` and its name to `LOCALE_META` in `src/i18n/locales.ts`.
2. Add a dictionary in `src/i18n/ui.ts`, an entry in `src/i18n/seo.ts` and one in
   `src/i18n/email.ts`. TypeScript lists anything missing.
3. Add `about.<code>.md` and `privacy.<code>.md` in `src/content`, and add them to the
   maps in `src/views/AboutPage.astro` and `PrivacyPage.astro`.
4. Add the code to the sitemap `locales` in `astro.config.mts`.

The new pages are generated automatically.

## Dark mode

- It follows the visitor's system setting until they press the switch (sun/moon in the
  top bar). Their choice is then kept in `localStorage` under `theme`; it never leaves
  their device, and the privacy notice says so.
- The theme is applied by a small inline script in `MainLayout.astro`'s `<head>` before
  the page paints, so there is no white flash.
- Colours: the page background and text come from the CSS variables in
  `src/styles/global.css` (`:root` for light, `.dark` for dark). Components use
  Tailwind's `dark:` variants for everything else.
- Inside `@apply` on a `::before`/`::after` rule, do not use `dark:`; write a separate
  `.dark .selector::after` rule instead (see `.nav-link` in `global.css`). The variant
  would be appended after the pseudo-element, which is invalid CSS and gets dropped.
- `/admin` stays light.
