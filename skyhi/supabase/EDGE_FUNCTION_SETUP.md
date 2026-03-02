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

## 3) Deploy edge function
Function code:
- `supabase/functions/lantern-processing/index.ts`

Deploy:
```bash
supabase functions deploy lantern-processing
```

## 4) Configure watch client
Update:
- `skyhi-watch-lite/config/skyhi.js`

Set:
- `edgeFunctionName: "lantern-processing"`
- `roomToken: "<access_token_from_sql>"`

## 5) Rebuild watch app
```bash
cd skyhi-watch-lite
zeus build
```

## Notes
- `anonKey` remains public; this is expected.
- Security now relies on:
  - strict RLS (no direct table read/write for clients)
  - edge function validation (`roomPin + roomToken`)
