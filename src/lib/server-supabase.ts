import { createClient } from "@supabase/supabase-js";
import { createMockClient } from "./mock/client";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Same mock switch as the client. When no real Supabase is configured,
// server routes also run against the shared in-memory dummy data.
export const USE_MOCK = !url || url.includes("placeholder");

export function serverSupabase() {
  if (USE_MOCK) return createMockClient() as unknown as ReturnType<typeof createClient>;
  return createClient(url!, serviceKey!);
}
