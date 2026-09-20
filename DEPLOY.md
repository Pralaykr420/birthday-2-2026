# Deploying, and getting it onto her phone

The app and the backend get deployed separately. The app is just files, so it
goes anywhere free. The backend needs to actually run, so it needs a host that
runs Node.

---

## Part 1: the backend

**Render** is the easiest free option. Railway and Fly work the same way.

1. Push this repo to GitHub (private — it has her photographs in it)
2. Render → **New** → **Web Service** → pick your repo
3. Settings:

   | Field | Value |
   |---|---|
   | Root directory | *(leave blank)* |
   | Build command | `pnpm install && pnpm --filter @workspace/api-server build` |
   | Start command | `pnpm --filter @workspace/api-server start` |

4. Environment variables:

   ```
   ADMIN_PASSWORD   = your password
   MONGODB_URI      = your Atlas connection string
   NODE_ENV         = production
   ALLOWED_ORIGINS  = https://whatever-the-app-url-is
   ```

   You will not know `ALLOWED_ORIGINS` until Part 2 is done. Leave it out for
   now and come back.

5. Deploy, then check `https://your-api.onrender.com/api/healthz`.
   You want `"storage":"mongodb"`.

> **Free tier warning.** Render puts free services to sleep after 15 minutes
> idle, and the next request takes ~40 seconds to wake it. That is fine here —
> the app never blocks on the backend, so a sleeping server just means her wish
> sits in the offline queue for a moment. But **open the health URL yourself
> around 11:45pm** on the night so it is awake and warm.

---

## Part 2: the app

**Vercel:**

1. Import the same repo
2. Settings:

   | Field | Value |
   |---|---|
   | Framework | Vite |
   | Root directory | `artifacts/omniscient-love` |
   | Build command | `pnpm install && pnpm build` |
   | Output directory | `dist` |

3. Environment variable:

   ```
   VITE_API_URL = https://your-api.onrender.com
   ```

4. Deploy. Now go back to Render and set `ALLOWED_ORIGINS` to the Vercel URL.

### Check it

Open the app on your phone. Make a wish. Then open `/#admin` and see if it
arrived. If it did, you are done.

---

## Part 3: getting it onto her phone without her noticing

Do this **the day before**, not on the day. You want the offline cache filled
and the permissions granted well in advance.

### Android

1. Open the URL in Chrome on her phone
2. **Wander through every room.** This is the part that matters — the service
   worker only saves what it has seen. Open each tab, scroll the timeline all
   the way down so every photo loads, open a couple of envelopes.
3. Menu (⋮) → **Add to Home screen** → **Install**
4. Tap the padlock in the address bar → **Permissions** → set **Microphone**
   and **Notifications** to Allow
5. Long-press the new icon → rename it to something dull. It already calls
   itself "Notes".
6. Drag it into a folder with other boring apps

### iPhone

1. Open the URL in **Safari** (not Chrome — only Safari can install a web app
   on iOS)
2. Wander through every room, as above
3. Share button → **Add to Home Screen**
4. Open it from the new icon and let it request the microphone, then allow
5. Rename and hide the icon

### Test it properly

Turn on **airplane mode** and open the app from the home screen icon.
Everything should still work: photos, letters, the cake, the lot. If anything
is missing, you did not open that part in step 2.

---

## Part 4: the night itself

- Around **11:45pm**, open the backend health URL yourself so the free server
  is awake
- Do **not** deploy anything on the day. A new deploy changes the service
  worker and her phone may be mid-update at exactly the wrong moment.
- The midnight takeover fires when she has the app open at 00:00. The
  notification is a nice extra, but phones are allowed to kill sleeping
  service workers, so do not rely on it — the plan should be that she opens it.

---

## Rehearsing midnight

Do not wait until the real thing to find out whether it works.

**The easy way:** open `love.config.ts` and set the birthday to tomorrow's
date. Change your phone's clock to 23:59. Watch the takeover fire. Then clear
the app's storage (Settings → Site settings → Clear) so the "already seen"
flag resets, and put the real date back.

**Remember to put the real date back.** Genuinely. Write yourself a note.

---

## If something goes wrong on the day

- **She sees an old version** → `public/sw.js`, bump `CACHE_VERSION`, redeploy
- **Nothing saves** → check the backend is awake. Her messages are queued on
  her phone and will send later; nothing is lost.
- **The app will not open at all** → the service worker has a stale cache.
  Have her open it in a normal browser tab rather than the home screen icon.
- **Total disaster** → the app works entirely without the backend. Every room,
  every photo, every letter. Only the saving stops.
