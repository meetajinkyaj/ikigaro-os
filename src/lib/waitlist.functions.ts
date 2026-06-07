import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DATABASE_ID = "3766ff1100d48048a082000c6b926ed8";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/notion/v1";

const InputSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
});

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
    const LOVABLE_API_KEY = env.LOVABLE_API_KEY;
    const NOTION_API_KEY = env.NOTION_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!NOTION_API_KEY) throw new Error("NOTION_API_KEY is not configured");

    const res = await fetch(`${GATEWAY_URL}/pages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": NOTION_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Email: {
            title: [{ type: "text", text: { content: data.email } }],
          },
          "Signed Up At": {
            date: { start: new Date().toISOString() },
          },
          Source: {
            rich_text: [
              { type: "text", text: { content: "Launching Soon Page" } },
            ],
          },
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Notion error", res.status, body);
      throw new Error(`Failed to save signup (${res.status})`);
    }

    return { ok: true as const };
  });
