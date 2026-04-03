# XDG Firebase Setup

## What this build does

- Public website content is loaded from JSON files in `xdg/data/`
- Member registrations and event registrations can be written to Firebase Cloud Firestore
- If Firebase is not configured yet, forms fall back to a local browser queue

## Files involved

- `xdg/firebase-config.js`
- `xdg/firebase-config.example.js`
- `xdg/firebase.js`
- `xdg/app.js`

## Firebase setup steps

1. Create a Firebase project in the Firebase console.
2. Add a Web app to the project.
3. Enable Cloud Firestore in production mode or test mode.
4. Copy the Web app config values from Firebase.
5. Replace the placeholders in `xdg/firebase-config.js`.
6. Set `firebaseEnabled` to `true`.
7. Deploy the site.

## Suggested Firestore collections

- `memberRegistrations`
- `eventRegistrations`

Each form submission writes a single document to one of those collections.

## Recommended document shape

### `memberRegistrations`

```json
{
  "type": "association-membership",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "family": "Mumbai Fam",
  "role": "Designer",
  "submittedAt": "2026-04-03T00:00:00.000Z"
}
```

### `eventRegistrations`

```json
{
  "type": "event-registration",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "family": "Mumbai Fam",
  "eventId": "mumbai-apr-xr-mixer",
  "eventTitle": "XDG Mumbai XR Mixer",
  "notes": "Interested in Lens Studio",
  "submittedAt": "2026-04-03T00:00:00.000Z"
}
```

## Suggested Firestore security rules

Use these as a starting point, then tighten them based on your admin model:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memberRegistrations/{document=**} {
      allow create: if true;
      allow read, update, delete: if false;
    }

    match /eventRegistrations/{document=**} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

For production, it is better to validate allowed fields and use App Check or a server layer later.

## How JSON content management works

You can manage public content by editing:

- `xdg/data/site.json`
- `xdg/data/families.json`
- `xdg/data/leaders.json`
- `xdg/data/events.json`

That means:

- add a new family by updating `families.json`
- add a new upcoming event by appending to `events.json`
- update attendee rankings in `leaders.json`
- update hero copy or stats in `site.json`

## Event recap galleries

This build supports two recap modes inside `events.json`:

1. Inline image gallery

```json
"gallery": {
  "mode": "images",
  "items": [
    "https://cdn.example.com/recaps/event-1/photo-1.jpg",
    "https://cdn.example.com/recaps/event-1/photo-2.jpg"
  ]
}
```

2. Google Photos link handoff

```json
"gallery": {
  "mode": "google-photos-link",
  "url": "https://photos.google.com/...",
  "label": "Open recap gallery"
}
```

## Important note on Google Photos

Directly turning a Google Photos share link into an automatic inline gallery is not something I would rely on for this site. The safer production pattern is:

1. Keep recap image URLs in your own CDN or Firebase Storage and list them in `events.json`
2. Or provide a Google Photos link as an external gallery handoff

If you want true automated recap ingestion later, the stronger approach is a backend or Cloud Function that copies approved image URLs into your own data layer.
