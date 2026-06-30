// =============================================================
// In-memory dummy dataset for the no-backend MVP.
// Mirrors supabase/seed.sql. All people/companies are fictional.
// Mutated at runtime by the mock client (insert/update/delete),
// and reset on a full page reload.
// =============================================================

export type Row = Record<string, unknown>;

const EVENT_ID = "11111111-1111-4111-8111-111111111111";

function freshDb(): Record<string, Row[]> {
  return {
    events: [
      {
        id: EVENT_ID,
        slug: "demo-founders-mixer-2026",
        name: "Demo Founders Mixer",
        event_date: "2026-07-15",
        location: "San Francisco, CA",
        description: "A sample networking event seeded so the dashboard has data to show.",
        image_url: null,
        luma_url: null,
        podcast_episodes: [],
        is_active: true,
        created_at: "2026-06-01T10:00:00.000Z",
      },
    ],

    luma_list: [
      { id: "g1", email: "ava.chen@example.com",   linkedin_url: "https://www.linkedin.com/in/ava-demo",   checked_in: true,  event_id: EVENT_ID },
      { id: "g2", email: "ben.ortiz@example.com",   linkedin_url: "https://www.linkedin.com/in/ben-demo",   checked_in: true,  event_id: EVENT_ID },
      { id: "g3", email: "chloe.kim@example.com",   linkedin_url: "https://www.linkedin.com/in/chloe-demo", checked_in: true,  event_id: EVENT_ID },
      { id: "g4", email: "dev.patel@example.com",   linkedin_url: "https://www.linkedin.com/in/dev-demo",   checked_in: true,  event_id: EVENT_ID },
      { id: "g5", email: "emma.rossi@example.com",  linkedin_url: "https://www.linkedin.com/in/emma-demo",  checked_in: false, event_id: EVENT_ID },
      { id: "g6", email: "finn.walsh@example.com",  linkedin_url: "https://www.linkedin.com/in/finn-demo",  checked_in: false, event_id: EVENT_ID },
    ],

    profiles: [
      { id: "p1", email: "ava.chen@example.com",  name: "Ava Chen",   company: "NorthStar AI",   role: "Founder & CEO",
        what_building: "AI copilots for operations teams",
        looking_for: ["Founding engineers", "Design partners"], can_offer: ["Intros to seed VCs", "Hiring advice"],
        event_id: EVENT_ID, created_at: "2026-06-05T12:00:00.000Z" },
      { id: "p2", email: "ben.ortiz@example.com", name: "Ben Ortiz",  company: "Ledgerly",       role: "Co-founder / CTO",
        what_building: "Embedded payments for SMB software",
        looking_for: ["Enterprise pilots", "Compliance advisor"], can_offer: ["Fintech infra help", "Backend mentoring"],
        event_id: EVENT_ID, created_at: "2026-06-05T12:05:00.000Z" },
      { id: "p3", email: "chloe.kim@example.com", name: "Chloe Kim",  company: "Sprout Health",  role: "Founder",
        what_building: "Remote care for chronic conditions",
        looking_for: ["Clinical advisors", "Seed investors"], can_offer: ["Healthcare GTM", "Regulatory intros"],
        event_id: EVENT_ID, created_at: "2026-06-05T12:10:00.000Z" },
      { id: "p4", email: "dev.patel@example.com", name: "Dev Patel",  company: "Forge Robotics", role: "Founder & CEO",
        what_building: "Warehouse automation arms",
        looking_for: ["Hardware engineers", "Pilot customers"], can_offer: ["Manufacturing intros", "Robotics advice"],
        event_id: EVENT_ID, created_at: "2026-06-05T12:15:00.000Z" },
      { id: "p5", email: "emma.rossi@example.com", name: "Emma Rossi", company: "Atlas Data",     role: "Co-founder",
        what_building: "Data quality monitoring for analytics teams",
        looking_for: ["Design partners", "Angel investors"], can_offer: ["Data engineering help", "SQL mentoring"],
        event_id: EVENT_ID, created_at: "2026-06-05T12:20:00.000Z" },
      { id: "p6", email: "finn.walsh@example.com", name: "Finn Walsh", company: "Cobalt Labs",    role: "Founder",
        what_building: "Developer tooling for AI agents",
        looking_for: ["Early users", "Founding designer"], can_offer: ["Dev-tools GTM", "OSS community advice"],
        event_id: EVENT_ID, created_at: "2026-06-05T12:25:00.000Z" },
    ],

    matches: [
      { id: "m1",  profile_email: "ava.chen@example.com",  match_email: "ben.ortiz@example.com",  match_rank: 1, score: 88, linkedin_url: "https://www.linkedin.com/in/ben-demo",   event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m2",  profile_email: "ava.chen@example.com",  match_email: "finn.walsh@example.com", match_rank: 2, score: 81, linkedin_url: "https://www.linkedin.com/in/finn-demo",  event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m3",  profile_email: "ben.ortiz@example.com", match_email: "ava.chen@example.com",   match_rank: 1, score: 88, linkedin_url: "https://www.linkedin.com/in/ava-demo",   event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m4",  profile_email: "ben.ortiz@example.com", match_email: "emma.rossi@example.com", match_rank: 2, score: 74, linkedin_url: "https://www.linkedin.com/in/emma-demo",  event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m5",  profile_email: "chloe.kim@example.com", match_email: "dev.patel@example.com",  match_rank: 1, score: 69, linkedin_url: "https://www.linkedin.com/in/dev-demo",   event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m6",  profile_email: "chloe.kim@example.com", match_email: "ava.chen@example.com",   match_rank: 2, score: 65, linkedin_url: "https://www.linkedin.com/in/ava-demo",   event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m7",  profile_email: "dev.patel@example.com", match_email: "chloe.kim@example.com",  match_rank: 1, score: 69, linkedin_url: "https://www.linkedin.com/in/chloe-demo", event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m8",  profile_email: "emma.rossi@example.com",match_email: "finn.walsh@example.com", match_rank: 1, score: 79, linkedin_url: "https://www.linkedin.com/in/finn-demo",  event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m9",  profile_email: "emma.rossi@example.com",match_email: "ben.ortiz@example.com",  match_rank: 2, score: 74, linkedin_url: "https://www.linkedin.com/in/ben-demo",   event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m10", profile_email: "finn.walsh@example.com",match_email: "emma.rossi@example.com", match_rank: 1, score: 79, linkedin_url: "https://www.linkedin.com/in/emma-demo",  event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
      { id: "m11", profile_email: "finn.walsh@example.com",match_email: "ava.chen@example.com",   match_rank: 2, score: 81, linkedin_url: "https://www.linkedin.com/in/ava-demo",   event_id: EVENT_ID, created_at: "2026-06-06T09:00:00.000Z" },
    ],

    admins: [
      { email: "rohanverma200in@gmail.com", added_by: null, created_at: "2026-06-01T10:00:00.000Z" },
    ],

    admin_otps: [],

    trending_events_cache: [],

    event_ideas: [
      { id: "i1", text: "Host a fintech founders dinner",             added_by: "admin", created_at: "2026-06-10T10:00:00.000Z" },
      { id: "i2", text: "Workshop: fundraising in a down market",     added_by: "admin", created_at: "2026-06-11T10:00:00.000Z" },
      { id: "i3", text: "Invite 3 angel investors as guest speakers", added_by: "admin", created_at: "2026-06-12T10:00:00.000Z" },
    ],
  };
}

// Single shared mutable store for the whole app session.
export const db: Record<string, Row[]> = freshDb();

export const DEMO_ADMIN_EMAIL = "rohanverma200in@gmail.com";
