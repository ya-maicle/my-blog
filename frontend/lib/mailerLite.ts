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

async function upsertSubscriber(email: string, name?: string | null) {
  const body: Record<string, unknown> = { email };
  if (name) {
    // "fields" can include arbitrary fields you have defined in MailerLite
    body.fields = { name };
  }

  const res = await fetch(`${API_BASE}/subscribers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  // 200/201/202 = ok; 409 may indicate existing depending on API behavior
  if (!res.ok && res.status !== 409) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `[MailerLite] Upsert subscriber failed (${res.status}): ${text}`
    );
  }
}

async function addSubscriberToGroup(email: string, groupId: string) {
  const res = await fetch(`${API_BASE}/groups/${groupId}/subscribers`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });

  // If already in group, some APIs return 409/422; treat as non-fatal.
  if (!res.ok && res.status !== 409 && res.status !== 422) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `[MailerLite] Add to group failed (${res.status}): ${text}`
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

  try {
    await upsertSubscriber(email, name ?? undefined);
    await addSubscriberToGroup(email, groupId);
    if (process.env.NODE_ENV === "development") {
      console.log("[MailerLite] Ensured subscriber is in Welcome group:", email);
    }
  } catch (err) {
    // Never throw to auth flow; just log for observability.
    console.error("[MailerLite] ensureInWelcomeGroup error:", err);
  }
}
