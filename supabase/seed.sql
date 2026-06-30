-- =============================================================
-- Event Matchmaking — DUMMY seed data (for the MVP demo)
-- Run AFTER schema.sql. Safe to re-run.
-- All people/companies/emails below are fictional placeholders.
-- =============================================================

do $$
declare ev uuid;
begin
  -- One active demo event ------------------------------------------------
  insert into events (slug, name, event_date, location, description, is_active)
  values (
    'demo-founders-mixer-2026',
    'Demo Founders Mixer',
    '2026-07-15',
    'San Francisco, CA',
    'A sample networking event seeded so the dashboard has data to show.',
    true
  )
  on conflict (slug) do update set name = excluded.name
  returning id into ev;

  -- Clear any prior demo rows for this event so re-runs stay clean -------
  delete from matches  where event_id = ev;
  delete from profiles where event_id = ev;
  delete from luma_list where event_id = ev;

  -- Invited guest list ---------------------------------------------------
  insert into luma_list (email, linkedin_url, checked_in, event_id) values
    ('ava.chen@example.com',     'https://www.linkedin.com/in/ava-demo',   true,  ev),
    ('ben.ortiz@example.com',    'https://www.linkedin.com/in/ben-demo',   true,  ev),
    ('chloe.kim@example.com',    'https://www.linkedin.com/in/chloe-demo', true,  ev),
    ('dev.patel@example.com',    'https://www.linkedin.com/in/dev-demo',   true,  ev),
    ('emma.rossi@example.com',   'https://www.linkedin.com/in/emma-demo',  false, ev),
    ('finn.walsh@example.com',   'https://www.linkedin.com/in/finn-demo',  false, ev)
  on conflict (event_id, email) do nothing;

  -- Registered attendee profiles ----------------------------------------
  insert into profiles (email, name, company, role, what_building, looking_for, can_offer, event_id) values
    ('ava.chen@example.com',  'Ava Chen',   'NorthStar AI',  'Founder & CEO',
       'AI copilots for operations teams',
       array['Founding engineers','Design partners'], array['Intros to seed VCs','Hiring advice'], ev),
    ('ben.ortiz@example.com', 'Ben Ortiz',  'Ledgerly',      'Co-founder / CTO',
       'Embedded payments for SMB software',
       array['Enterprise pilots','Compliance advisor'], array['Fintech infra help','Backend mentoring'], ev),
    ('chloe.kim@example.com', 'Chloe Kim',  'Sprout Health', 'Founder',
       'Remote care for chronic conditions',
       array['Clinical advisors','Seed investors'], array['Healthcare GTM','Regulatory intros'], ev),
    ('dev.patel@example.com', 'Dev Patel',  'Forge Robotics','Founder & CEO',
       'Warehouse automation arms',
       array['Hardware engineers','Pilot customers'], array['Manufacturing intros','Robotics advice'], ev),
    ('emma.rossi@example.com','Emma Rossi', 'Atlas Data',    'Co-founder',
       'Data quality monitoring for analytics teams',
       array['Design partners','Angel investors'], array['Data engineering help','SQL mentoring'], ev),
    ('finn.walsh@example.com','Finn Walsh', 'Cobalt Labs',   'Founder',
       'Developer tooling for AI agents',
       array['Early users','Founding designer'], array['Dev-tools GTM','OSS community advice'], ev)
  on conflict (event_id, email) do nothing;

  -- Precomputed dummy matches (top picks per attendee) ------------------
  insert into matches (profile_email, match_email, match_rank, score, linkedin_url, event_id) values
    ('ava.chen@example.com',  'ben.ortiz@example.com',  1, 88, 'https://www.linkedin.com/in/ben-demo',   ev),
    ('ava.chen@example.com',  'finn.walsh@example.com', 2, 81, 'https://www.linkedin.com/in/finn-demo',  ev),
    ('ben.ortiz@example.com', 'ava.chen@example.com',   1, 88, 'https://www.linkedin.com/in/ava-demo',   ev),
    ('ben.ortiz@example.com', 'emma.rossi@example.com', 2, 74, 'https://www.linkedin.com/in/emma-demo',  ev),
    ('chloe.kim@example.com', 'dev.patel@example.com',  1, 69, 'https://www.linkedin.com/in/dev-demo',   ev),
    ('chloe.kim@example.com', 'ava.chen@example.com',   2, 65, 'https://www.linkedin.com/in/ava-demo',   ev),
    ('dev.patel@example.com', 'chloe.kim@example.com',  1, 69, 'https://www.linkedin.com/in/chloe-demo', ev),
    ('emma.rossi@example.com','finn.walsh@example.com', 1, 79, 'https://www.linkedin.com/in/finn-demo',  ev),
    ('emma.rossi@example.com','ben.ortiz@example.com',  2, 74, 'https://www.linkedin.com/in/ben-demo',   ev),
    ('finn.walsh@example.com','emma.rossi@example.com', 1, 79, 'https://www.linkedin.com/in/emma-demo',  ev),
    ('finn.walsh@example.com','ava.chen@example.com',   2, 81, 'https://www.linkedin.com/in/ava-demo',   ev);
end $$;

-- A couple of admin scratchpad ideas -------------------------------------
insert into event_ideas (text, added_by) values
  ('Host a fintech founders dinner',                'admin'),
  ('Workshop: fundraising in a down market',        'admin'),
  ('Invite 3 angel investors as guest speakers',    'admin')
on conflict do nothing;
