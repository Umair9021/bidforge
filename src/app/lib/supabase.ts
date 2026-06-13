import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

// Singleton Supabase client for the frontend.
// Stored on globalThis so hot-module-reloads and any duplicate module loads
// reuse the SAME GoTrueClient instance (otherwise the SDK warns about multiple
// instances sharing one storage key, which can corrupt the auth session).
const GLOBAL_KEY = "__bidforge_supabase__";
const STORAGE_KEY = `sb-${projectId}-auth-token`;

type GlobalWithClient = typeof globalThis & {
  [GLOBAL_KEY]?: SupabaseClient;
};

export function getSupabase(): SupabaseClient {
  const g = globalThis as GlobalWithClient;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: STORAGE_KEY,
        },
      },
    );
  }
  return g[GLOBAL_KEY]!;
}

// Base URL for the Hono edge server.
export const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b819b135`;

export { publicAnonKey };
