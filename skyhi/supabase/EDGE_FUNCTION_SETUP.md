# SkyHi Secure Gateway Setup

## 1) Apply migration
Run SQL from:
- `supabase/migrations/20260302_lantern_security.sql`

This will:
- create `sky_rooms(room_id, access_token, active)`
- lock down direct client access to `lanterns`
- require Edge Function for reads/writes

## 2) Create/rotate room token
In SQL editor, run:

```sql
insert into public.sky_rooms(room_id, access_token, active)
values ('1102', encode(gen_random_bytes(24), 'hex'), true)
on conflict (room_id)
do update set access_token = excluded.access_token, active = true;

select room_id, access_token from public.sky_rooms where room_id = '1102';
```

## 3) Configure Snap server-side secrets
Add these edge-function secrets before deploying:
- `SNAP_CLIENT_SECRET`
- `SNAP_CONFIDENTIAL_CLIENT_ID` (optional if you keep the current fallback in code)
- `SKYHI_SESSION_SECRET` (recommended; if omitted, the code falls back to `SNAP_CLIENT_SECRET` for signing)

## 4) Deploy edge functions
Function code:
- `supabase/functions/lantern-processing/index.ts`
- `supabase/functions/snap-session/index.ts`

Make sure `supabase/config.toml` is deployed with:
- `verify_jwt = false` for `lantern-processing`
- `verify_jwt = false` for `snap-session`

Deploy:
```bash
supabase functions deploy lantern-processing
supabase functions deploy snap-session
```

## 5) Configure watch client
Update:
- `skyhi-watch-lite/config/skyhi.js`

Set:
- `edgeFunctionName: "lantern-processing"`
- `roomToken: "<access_token_from_sql>"`

## 6) Rebuild watch app
```bash
cd skyhi-watch-lite
zeus build
```

## Notes
- Web companion authentication now relies on:
  - Snapchat OAuth code exchange in `snap-session`
  - a signed server-issued SkyHi session token
  - edge function validation of `x-skyhi-session`
- Spectacles / watch callers can continue to use their non-browser auth path.
