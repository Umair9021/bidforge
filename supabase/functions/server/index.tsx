import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const AVATAR_BUCKET = "make-b819b135-avatars";

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function authedUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const supabase = adminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// Init avatar bucket
(async () => {
  try {
    const supabase = adminClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === AVATAR_BUCKET);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(AVATAR_BUCKET, { public: false });
      if (error) console.log(`Bucket creation error: ${error.message}`);
      else console.log(`Created bucket: ${AVATAR_BUCKET}`);
    }
  } catch (err) {
    console.log(`Bucket init error: ${err}`);
  }
})();

app.get("/make-server-b819b135/health", (c) => c.json({ status: "ok" }));

// Upload avatar — accepts multipart/form-data with a "file" field
app.post("/make-server-b819b135/avatar", async (c) => {
  const user = await authedUser(c.req.header("Authorization") ?? null);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch (err) {
    return c.json({ error: `Failed to parse form data: ${err}` }, 400);
  }

  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "No file provided" }, 400);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
    return c.json({ error: "Only JPG, PNG, or WebP allowed" }, 400);
  }
  if (file.size > 2 * 1024 * 1024) {
    return c.json({ error: "File must be under 2 MB" }, 400);
  }

  const path = `${user.id}/avatar.${ext}`;
  const supabase = adminClient();
  const { error: upErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (upErr) {
    console.log(`Avatar upload error for ${user.id}: ${upErr.message}`);
    return c.json({ error: `Upload failed: ${upErr.message}` }, 500);
  }

  const { data: signedData, error: signErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7-day URL

  if (signErr) {
    console.log(`Signed URL error for ${user.id}: ${signErr.message}`);
    return c.json({ error: `Could not create signed URL: ${signErr.message}` }, 500);
  }

  // Store the storage path in user metadata so we can refresh the signed URL later
  await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, avatar_path: path },
  });

  return c.json({ url: signedData.signedUrl });
});

// Refresh avatar signed URL
app.get("/make-server-b819b135/avatar", async (c) => {
  const user = await authedUser(c.req.header("Authorization") ?? null);
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const path = user.user_metadata?.avatar_path as string | undefined;
  if (!path) return c.json({ url: null });

  const supabase = adminClient();
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ url: data.signedUrl });
});

Deno.serve(app.fetch);
