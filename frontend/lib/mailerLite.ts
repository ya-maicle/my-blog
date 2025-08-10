/**
 * Minimal MailerLite (New API) helper.
 * - Creates/updates a subscriber
 * - Adds subscriber to the configured Welcome group (to trigger your automation)
 *
 * Configure env:
 * - MAILERLITE_API_KEY
 * - MAILERLITE_WELCOME_GROUP_ID
 * - Optional: MAILERLITE_API_BASE (defaults to "https://connect.mailerlite.com/api")
 */
type EnsureArgs = {
  email: string;
  name?: string | null;
};

const API_BASE =
  process.env.MAILERLITE_API_BASE || "https://connect.mailerlite.com/api";

function getHeaders() {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MAILERLITE_API_KEY is not set. Add it to your environment."
    );
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  } as const;
}

async function upsertSubscriber(email: string, name?: string | null, groupId?: string) {
  const body: Record<string, unknown> = { email };
  if (name) {
    // "fields" can include arbitrary fields you have defined in MailerLite
    body.fields = { name };
  }
  if (groupId) {
    // Add subscriber to group in the same upsert call (non-destructive)
    body.groups = [groupId];
  }

  const res = await fetch(`${API_BASE}/subscribers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (process.env.NODE_ENV === "development") {
    console.log("[MailerLite] upsertSubscriber", { status: res.status });
  }

  // 200/201/202 = ok; 409/422 may indicate existing depending on API behavior
  if (!res.ok && res.status !== 409 && res.status !== 422) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `[MailerLite] Upsert subscriber failed (${res.status}): ${text}`
    );
  }
}


export async function ensureInWelcomeGroup({ email, name }: EnsureArgs) {
  const groupId = process.env.MAILERLITE_WELCOME_GROUP_ID;
  if (!groupId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[MailerLite] MAILERLITE_WELCOME_GROUP_ID not set; skipping add to group"
      );
    }
    return;
  }

  if (!email) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[MailerLite] Missing email; skipping subscription");
    }
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[MailerLite] ensureInWelcomeGroup start", { email, groupId, apiBase: API_BASE });
  }
  // Let errors bubble so callers can decide whether to mark welcomedAt.
  await upsertSubscriber(email, name ?? undefined, groupId);

  if (process.env.NODE_ENV === "development") {
    console.log("[MailerLite] Ensured subscriber is in Welcome group:", email);
  }
}
