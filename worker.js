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

// A slim brand footer carrying the required legal links + waitlist consent
// line. index.html is a machine-generated single-file snapshot we don't
// hand-edit, so we inject this into the landing HTML at the edge (see below):
// it stays in the served HTML (crawlable), and is easy to change or revert.
// Link color is Clay Ember (#CD7144), which meets AA contrast on charcoal.
const LEGAL_FOOTER = `
<footer style="background:#1B1815;border-top:1px solid rgba(241,233,220,0.14);padding:40px 24px;text-align:center;font-family:'Hanken Grotesk',-apple-system,BlinkMacSystemFont,sans-serif;color:#C9B79C;">
  <div style="max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:12px;align-items:center;">
    <p style="font-family:'Marcellus',Georgia,serif;text-transform:uppercase;letter-spacing:0.28em;font-size:11px;color:#C9B79C;margin:0;">Performance &middot; Recovery &middot; Longevity</p>
    <nav style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center;font-size:13px;">
      <a href="/privacy" style="color:#CD7144;text-decoration:none;">Privacy Policy</a>
      <a href="/terms" style="color:#CD7144;text-decoration:none;">Terms of Service</a>
      <a href="mailto:hello@ikigaro.com" style="color:#C9B79C;text-decoration:none;">hello@ikigaro.com</a>
    </nav>
    <p style="font-size:12px;color:#8A7E6F;margin:0;">By joining the waitlist, you agree to our <a href="/terms" style="color:#CD7144;">Terms</a> and <a href="/privacy" style="color:#CD7144;">Privacy Policy</a>.</p>
    <p style="font-size:11px;color:#8A7E6F;margin:0;">&copy; 2026 Ikigaro Club</p>
  </div>
</footer>`;

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

    // All other requests → static assets (index.html, fonts, images, etc.).
    const assetResponse = await env.ASSETS.fetch(request);

    // Inject the legal footer into the landing page only. /privacy and /terms
    // ship their own footers; assets (fonts, images, JSON) pass through untouched.
    const isRoot = url.pathname === "/" || url.pathname === "/index.html";
    const isHtml = (assetResponse.headers.get("content-type") || "").includes("text/html");
    if (isRoot && isHtml) {
      return new HTMLRewriter()
        .on("body", {
          element(el) {
            el.append(LEGAL_FOOTER, { html: true });
          },
        })
        .transform(assetResponse);
    }
    return assetResponse;
  },
};
