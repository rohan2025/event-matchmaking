// =============================================================
// Minimal in-memory stand-in for the Supabase JS client.
// Supports the query/auth surface this app actually uses so the
// MVP runs with zero backend. NOT a full Supabase implementation.
// =============================================================
import { db, DEMO_ADMIN_EMAIL, type Row } from "./data";

type Op = "select" | "insert" | "upsert" | "update" | "delete";
type Filter = { col: string; op: "eq" | "neq" | "is" | "in"; val: unknown };

const PK: Record<string, string> = {
  events: "id",
  profiles: "id",
  luma_list: "id",
  matches: "id",
  event_ideas: "id",
  trending_events_cache: "id",
  admins: "email",
  admin_otps: "email",
};

const HAS_CREATED_AT = new Set([
  "events", "profiles", "matches", "admins", "admin_otps", "event_ideas",
]);

type Result = { data: unknown; error: { message: string; code?: string } | null; count?: number };

class MockQuery implements PromiseLike<Result> {
  private filters: Filter[] = [];
  private op: Op = "select";
  private payload: Row[] | Row | null = null;
  private orderSpec: { col: string; asc: boolean } | null = null;
  private limitN: number | null = null;
  private wantSingle = false;
  private countMode = false;
  private headMode = false;

  constructor(private table: string) {}

  private rows(): Row[] {
    if (!db[this.table]) db[this.table] = [];
    return db[this.table];
  }

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.count) this.countMode = true;
    if (opts?.head) this.headMode = true;
    return this;
  }
  insert(rows: Row | Row[]) { this.op = "insert"; this.payload = rows; return this; }
  upsert(rows: Row | Row[]) { this.op = "upsert"; this.payload = rows; return this; }
  update(vals: Row) { this.op = "update"; this.payload = vals; return this; }
  delete() { this.op = "delete"; return this; }

  eq(col: string, val: unknown) { this.filters.push({ col, op: "eq", val }); return this; }
  neq(col: string, val: unknown) { this.filters.push({ col, op: "neq", val }); return this; }
  is(col: string, val: unknown) { this.filters.push({ col, op: "is", val }); return this; }
  in(col: string, vals: unknown[]) { this.filters.push({ col, op: "in", val: vals }); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderSpec = { col, asc: opts?.ascending !== false };
    return this;
  }
  limit(n: number) { this.limitN = n; return this; }
  single() { this.wantSingle = true; return this; }
  maybeSingle() { this.wantSingle = true; return this; }

  private matches(r: Row): boolean {
    return this.filters.every((f) => {
      const v = r[f.col];
      switch (f.op) {
        case "eq": return v === f.val;
        case "neq": return v !== f.val;
        case "is": return f.val === null ? v === null || v === undefined : v === f.val;
        case "in": return Array.isArray(f.val) && (f.val as unknown[]).includes(v);
        default: return true;
      }
    });
  }

  private exec(): Result {
    const all = this.rows();
    const matched = all.filter((r) => this.matches(r));
    let data: unknown = null;
    let error: Result["error"] = null;
    let count: number | undefined;

    if (this.op === "select") {
      let sel = matched;
      if (this.orderSpec) {
        const { col, asc } = this.orderSpec;
        sel = [...sel].sort((a, b) => {
          const x = a[col] as never, y = b[col] as never;
          if (x === y) return 0;
          return (x < y ? -1 : 1) * (asc ? 1 : -1);
        });
      }
      if (this.limitN != null) sel = sel.slice(0, this.limitN);
      count = matched.length;
      data = this.headMode ? null : sel;
    } else if (this.op === "insert" || this.op === "upsert") {
      const pk = PK[this.table] ?? "id";
      const incoming = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      const written: Row[] = [];
      for (const raw of incoming) {
        const row: Row = { ...raw };
        if (pk === "id" && row.id == null) row.id = cryptoId();
        if (HAS_CREATED_AT.has(this.table) && row.created_at == null) {
          row.created_at = new Date().toISOString();
        }
        if (this.op === "upsert") {
          const idx = all.findIndex((r) => r[pk] === row[pk]);
          if (idx >= 0) { all[idx] = { ...all[idx], ...row }; written.push(all[idx]); continue; }
        }
        all.push(row);
        written.push(row);
      }
      data = written;
    } else if (this.op === "update") {
      const updated: Row[] = [];
      for (const r of all) {
        if (this.matches(r)) { Object.assign(r, this.payload as Row); updated.push(r); }
      }
      data = updated;
    } else if (this.op === "delete") {
      const keep: Row[] = [];
      const removed: Row[] = [];
      for (const r of all) (this.matches(r) ? removed : keep).push(r);
      db[this.table] = keep;
      data = removed;
    }

    if (this.wantSingle) {
      const arr = Array.isArray(data) ? data : [];
      data = arr.length > 0 ? arr[0] : null;
      if (data == null && this.op === "select") {
        error = { message: "No rows found", code: "PGRST116" };
      }
    }

    const res: Result = { data, error };
    if (this.countMode) res.count = count ?? (Array.isArray(data) ? data.length : 0);
    return res;
  }

  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.exec()).then(onfulfilled, onrejected);
  }
}

function cryptoId(): string {
  try {
    return (globalThis.crypto as Crypto).randomUUID();
  } catch {
    return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

// ── Auth (demo: start signed-out; Google button signs in as admin) ──
type Session = { access_token: string; user: { id: string; email: string; user_metadata: Record<string, unknown> } } | null;

function makeAuth() {
  const adminUser = {
    id: "mock-admin",
    email: DEMO_ADMIN_EMAIL,
    user_metadata: { full_name: "Demo Admin", name: "Demo Admin", avatar_url: null },
  };

  // Demo starts signed in as the admin so the dashboard loads with no login step.
  // (Sign out still works, and the Google button re-signs in.)
  let session: Session = { access_token: "mock-token", user: adminUser };
  const listeners: Array<(event: string, session: Session) => void> = [];
  const emit = (event: string) => listeners.forEach((cb) => cb(event, session));

  return {
    async getSession() { return { data: { session }, error: null }; },
    async getUser(_token?: string) {
      return { data: { user: session?.user ?? adminUser }, error: null };
    },
    onAuthStateChange(cb: (event: string, session: Session) => void) {
      listeners.push(cb);
      return {
        data: {
          subscription: {
            unsubscribe() {
              const i = listeners.indexOf(cb);
              if (i >= 0) listeners.splice(i, 1);
            },
          },
        },
      };
    },
    async signInWithOAuth(_opts?: unknown) {
      session = { access_token: "mock-token", user: adminUser };
      emit("SIGNED_IN");
      return { data: { provider: "google", url: null }, error: null };
    },
    async signInWithOtp(_opts?: unknown) {
      // Pretend a 6-digit code was emailed. Any code verifies in demo mode.
      return { data: {}, error: null };
    },
    async verifyOtp(opts?: { email?: string }) {
      const email = opts?.email ?? "guest@example.com";
      session = { access_token: "mock-token", user: { id: "mock-guest", email, user_metadata: {} } };
      emit("SIGNED_IN");
      return { data: { session, user: session.user }, error: null };
    },
    async signOut() { session = null; emit("SIGNED_OUT"); return { error: null }; },
  };
}

export function createMockClient() {
  return {
    from(table: string) { return new MockQuery(table); },
    auth: makeAuth(),
  };
}
