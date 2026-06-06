Build an email waitlist form that stores submissions in the connected Notion database `3766ff1100d48048a082000c6b926ed8`.

## Files

1. **`src/lib/waitlist.functions.ts`** (new) — `createServerFn` `joinWaitlist`:
   - Zod validates `{ email }` (trim, email, max 255).
   - POST `https://connector-gateway.lovable.dev/notion/v1/pages` with `Authorization: Bearer ${LOVABLE_API_KEY}` and `X-Connection-Api-Key: ${NOTION_API_KEY}`.
   - Body: `parent: { database_id: "3766ff1100d48048a082000c6b926ed8" }`, properties: Email (title), Signed Up At (date = now), Source (rich_text "Launching Soon Page").
   - Returns `{ ok: true }` or throws with Notion error.

2. **`src/components/WaitlistForm.tsx`** (new) — Email input + submit button using existing shadcn `Input`/`Button`, `useServerFn` + react-query `useMutation`, client-side zod validation, states: idle → submitting → success → error. Styled with existing design tokens.

3. **`src/routes/index.tsx`** (edit) — Add "Join the waitlist" heading + subline + `<WaitlistForm />` in the right column of the hero.

Out of scope: duplicate-email checks, admin view, email confirmation, styles.css changes.