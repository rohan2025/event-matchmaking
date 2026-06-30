import { createClient } from "@supabase/supabase-js";
import { createMockClient } from "./mock/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock mode: no real Supabase configured → run the app on in-memory dummy data.
export const USE_MOCK = !supabaseUrl || supabaseUrl.includes("placeholder");

export const supabase = USE_MOCK
  ? (createMockClient() as unknown as ReturnType<typeof createClient>)
  : createClient(supabaseUrl!, supabaseAnonKey!);
