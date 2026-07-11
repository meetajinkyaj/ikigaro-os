// Ikigaro landing Worker.
// Serves the self-contained static landing page (via the ASSETS binding) and
// exposes a single JSON endpoint, POST /api/waitlist, which stores each signup
// as a row in the same Notion database the previous site used. The Notion
// integration token is read from the NOTION_API_KEY secret (already configured
// on this Worker). Nothing else is required to run.

const NOTION_DATABASE_ID = "3766ff1100d480cca7d3eac8fbf91d2a";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function isValidEmail(v) {
  if (typeof v !== "string") return false;
  const at = v.indexOf("@");
  const dot = v.lastIndexOf(".");
  return (
    at > 0 && dot > at + 1 && dot < v.length - 1 && v.indexOf(" ") === -1 && v.length <= 255
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/waitlist") {
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

      let email;
      try {
        const body = await request.json();
        email = (body && typeof body.email === "string" ? body.email : "").trim();
      } catch {
        return json({ error: "Invalid request" }, 400);
      }

      if (!isValidEmail(email)) {
        return json({ error: "Please enter a valid email address." }, 400);
      }

      const key = env.NOTION_API_KEY;
      if (!key) {
        console.error("NOTION_API_KEY is not configured");
        return json({ error: "Server not configured" }, 500);
      }

      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent: { database_id: NOTION_DATABASE_ID },
          properties: {
            Email: { title: [{ type: "text", text: { content: email } }] },
            "Signed Up At": { date: { start: new Date().toISOString() } },
            Source: { select: { name: "Launching Soon Page" } },
          },
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("Notion error", res.status, t);
        return json({ error: "Failed to save signup. Please try again." }, 502);
      }

      return json({ ok: true });
    }

    // All other requests → static assets (index.html, fonts, images, etc.)
    return env.ASSETS.fetch(request);
  },
};
