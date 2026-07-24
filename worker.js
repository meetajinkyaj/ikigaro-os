// Ikigaro landing Worker.
// Serves the self-contained static landing page (via the ASSETS binding) and
// retargets every waitlist call-to-action to the live app at
// https://app.ikigaro.com, where signups go through the app's own beta
// waitlist. The old Notion-backed POST /api/waitlist endpoint is gone; the
// route answers 410 so any stale cached page that still posts gets a clear
// pointer to the app instead of a silent failure.

const APP_URL = "https://app.ikigaro.com";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// A slim brand footer carrying the required legal links + signup consent
// line. index.html is a machine-generated single-file snapshot we don't
// hand-edit, so we inject this into the landing HTML at the edge (see below):
// it stays in the served HTML (crawlable), and is easy to change or revert.
// Link color is Clay Ember (#CD7144), which meets AA contrast on charcoal.
const LEGAL_FOOTER = `
<footer id="ikigaro-legal-footer" style="background:#1B1815;border-top:1px solid rgba(241,233,220,0.14);padding:40px 24px;text-align:center;font-family:'Hanken Grotesk',-apple-system,BlinkMacSystemFont,sans-serif;color:#C9B79C;">
  <div style="max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:12px;align-items:center;">
    <p style="font-size:14px;color:#C9B79C;margin:0;max-width:520px;">The Ikigaro app is live in private beta &mdash; build your baseline before the Space opens. <a href="${APP_URL}" style="color:#CD7144;text-decoration:none;">app.ikigaro.com&nbsp;&rarr;</a></p>
    <nav style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center;font-size:13px;">
      <a href="/privacy" style="color:#CD7144;text-decoration:none;">Privacy Policy</a>
      <a href="/terms" style="color:#CD7144;text-decoration:none;">Terms of Service</a>
      <a href="mailto:hello@ikigaro.com" style="color:#C9B79C;text-decoration:none;">hello@ikigaro.com</a>
    </nav>
    <p style="font-size:12px;color:#8A7E6F;margin:0;">By creating an account, you agree to our <a href="/terms" style="color:#CD7144;">Terms</a> and <a href="/privacy" style="color:#CD7144;">Privacy Policy</a>.</p>
    <p style="font-size:11px;color:#8A7E6F;margin:0;">&copy; 2026 Ikigaro Club</p>
  </div>
</footer>`;

// The landing snapshot renders client-side (Babel), so HTMLRewriter can't
// reach the waitlist form — it doesn't exist in the served HTML. Instead we
// inject this script, which patches the rendered DOM (stable data-dc-tpl
// anchors survive re-renders of the snapshot):
//   - points every "Join the waitlist" CTA (a[href="#waitlist"]) at the app,
//   - swaps the email form in the bottom section for a signup button,
//   - retitles that section's copy for the live private beta,
//   - re-appends the legal footer, which the bootstrap otherwise destroys.
//
// IMPORTANT: the snapshot's bootstrap REPLACES THE WHOLE DOCUMENT while
// rendering (everything HTMLRewriter injected into the served HTML — this
// script tag included — is wiped from the DOM), and can re-render afterwards.
// Window timers survive that replacement; MutationObservers bound to the old
// body do not. So the only reliable mechanism is a persistent interval
// running an idempotent apply() — every change checks before writing, and a
// stable id on the footer keeps it from duplicating. Each pass is a handful
// of attribute-selector lookups: negligible. Everything is defensive — if an
// anchor is missing, the page keeps its original behavior for that element.
const APP_CTA_SCRIPT = `
<script>
(function () {
  var APP = ${JSON.stringify(APP_URL)};
  var SUB_COPY = 'The Ikigaro app is in private beta. Create your account, join the waitlist in-app, and start building your baseline before the Space opens.';
  var FOOTER_HTML = ${JSON.stringify(LEGAL_FOOTER)};

  function apply() {
    document.querySelectorAll('a[href="#waitlist"]').forEach(function (a) {
      a.href = APP;
    });

    var eyebrow = document.querySelector('[data-dc-tpl="303"]');
    if (eyebrow && eyebrow.textContent !== 'The app is live') {
      eyebrow.textContent = 'The app is live';
    }
    var sub = document.querySelector('[data-dc-tpl="305"]');
    if (sub && sub.textContent !== SUB_COPY) sub.textContent = SUB_COPY;

    var form = document.querySelector('[data-dc-tpl="307"]');
    if (form) {
      var btn = document.createElement('a');
      btn.href = APP;
      btn.textContent = 'Sign up at app.ikigaro.com \\u2192';
      var submit = document.querySelector('[data-dc-tpl="309"]');
      btn.style.cssText = submit
        ? submit.style.cssText + ';text-decoration:none;display:inline-block;'
        : 'font-family:var(--font-label);font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgb(246,239,227);background:rgb(181,86,45);border:1px solid rgb(181,86,45);border-radius:8px;padding:15px 28px;text-decoration:none;display:inline-block;';
      form.replaceWith(btn);
    }

    var note = document.querySelector('[data-dc-tpl="310"]');
    if (note && note.hasAttribute('role')) {
      note.removeAttribute('role');
      note.removeAttribute('aria-live');
      note.textContent = 'Free during beta \\u00b7 Works on any phone \\u2014 no app store needed.';
    }

    // The old "No spam, one email when it matters" promise described the
    // email capture; keep only the social proof now that signups are in-app.
    var footnote = document.querySelector('[data-dc-tpl="317"]');
    if (footnote && footnote.textContent !== '1,400+ ahead of opening') {
      footnote.textContent = '1,400+ ahead of opening';
    }

    // Restore the legal footer once the snapshot has rendered (the bootstrap
    // wipes the server-injected copy along with the rest of the document).
    // It must live INSIDE the rendered tree — appended to <body> it falls
    // outside the snapshot's layout flow and paints mid-page — so it goes
    // right after the site footer section (tpl 318).
    var siteFooter = document.querySelector('[data-dc-tpl="318"]');
    if (siteFooter && !document.getElementById('ikigaro-legal-footer')) {
      siteFooter.insertAdjacentHTML('afterend', FOOTER_HTML);
    }
  }

  apply();
  setInterval(apply, 300);
})();
</script>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Retired Notion endpoint: stale cached pages may still POST here.
    if (url.pathname === "/api/waitlist") {
      return json(
        { error: "The waitlist has moved. Sign up at " + APP_URL },
        410,
      );
    }

    // All other requests → static assets (index.html, fonts, images, etc.).
    const assetResponse = await env.ASSETS.fetch(request);

    // Inject the legal footer + CTA retarget into the landing page only.
    // /privacy and /terms ship their own footers; assets pass through untouched.
    const isRoot = url.pathname === "/" || url.pathname === "/index.html";
    const isHtml = (assetResponse.headers.get("content-type") || "").includes("text/html");
    if (isRoot && isHtml) {
      return new HTMLRewriter()
        .on("body", {
          element(el) {
            el.append(LEGAL_FOOTER, { html: true });
            el.append(APP_CTA_SCRIPT, { html: true });
          },
        })
        .transform(assetResponse);
    }
    return assetResponse;
  },
};
