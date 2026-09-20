# Setup

## 1. What you need

- **Node.js 20 or newer** — check with `node -v`
- **pnpm** — install with `npm install -g pnpm`

## 2. Install

```bash
pnpm install
```

## 3. Settings

```bash
cp .env.example .env
```

Open `.env` and set one thing:

```
ADMIN_PASSWORD=something-she-would-never-guess
```

Then open `artifacts/omniscient-love/src/config/love.config.ts` and set
`adminPassword` to **exactly the same string**. Those two have to match or your
inbox will not open.

## 4. Run it

```bash
pnpm dev
```

This starts both halves at once:

- the app on **http://localhost:5173**
- the backend on **http://localhost:3001**

To run just one: `pnpm dev:app` or `pnpm dev:api`.

## 5. Test it on your phone — do not skip this

This is a phone app. A desktop browser will not show you the problems.

Find your laptop's address on the wifi:

```bash
# macOS / Linux
ipconfig getifaddr en0 || hostname -I

# Windows
ipconfig
```

Then on your phone, with both on the same wifi, open
`http://192.168.x.x:5173` (your address, not that one).

**The microphone will not work over plain `http://`.** Browsers only allow it
on `https://` or on `localhost`. So the candles will fall back to the tap
button when testing this way. That is expected. It works properly once
deployed, because your host gives you `https://`.

---

## 6. Adding MongoDB

Entirely optional. Without it, the server saves to `data/omniscient.json` and
everything works. Add Mongo when you want the data to survive the server
restarting, which on free hosting happens whenever it goes idle.

1. Make a free cluster at **[mongodb.com/atlas](https://www.mongodb.com/atlas)**
   (the M0 tier is free forever)
2. **Database Access** → add a user, note the password
3. **Network Access** → add `0.0.0.0/0`
   *(this allows connections from anywhere; needed because free hosts do not
   give you a fixed address to allowlist)*
4. **Connect** → **Drivers** → copy the connection string
5. Put it in `.env`:

```
MONGODB_URI=mongodb+srv://omniscient:YOURPASSWORD@cluster0.xxxxx.mongodb.net/omniscient?retryWrites=true&w=majority
```

Replace `YOURPASSWORD`. If your password has symbols in it like `@` or `#`,
they have to be percent-encoded, or just pick a password with only letters and
numbers and save yourself the trouble.

You do **not** need to create any collections. Mongoose makes them the first
time something is saved.

### Check it worked

```bash
pnpm dev:api
```

Look at the log. You want:

```
INFO: Saving to MongoDB
```

If you see `Could not reach MongoDB, falling back to a file`, then one of:
the password is wrong, you skipped the `0.0.0.0/0` step, or the connection
string got mangled on the way over.

You can also just ask the server:

```bash
curl http://localhost:3001/api/healthz
# {"status":"ok","storage":"mongodb", ...}
```

`"storage"` tells you which one it is actually using.

---

## 7. Check everything end to end

With the backend running:

```bash
# make a wish
curl -X POST http://localhost:3001/api/wishes \
  -H 'Content-Type: application/json' \
  -d '{"text":"testing"}'

# read your inbox
curl -H 'x-admin-password: YOUR_PASSWORD' \
  http://localhost:3001/api/admin/everything
```

If the second one returns your test wish, the whole chain works.

---

## 8. Before you call it done

```bash
pnpm typecheck    # catches mistakes before she does
pnpm build        # make sure it actually builds
```

---

## Common problems

**"Missing environment variable ADMIN_PASSWORD"**
You have not made `.env` yet, or you made it in the wrong folder. It goes in
the project root, next to `package.json`.

**The admin page says the password is wrong**
`ADMIN_PASSWORD` in `.env` and `adminPassword` in `love.config.ts` are not
identical. Check for a trailing space.

**The app loads but nothing saves**
The backend is not running. Start it with `pnpm dev:api` and check
`http://localhost:3001/api/healthz`.

**The microphone does nothing**
Only works on `https://` or `localhost`. Use the tap button while developing.

**She is still seeing the old version after I deployed**
Open `public/sw.js` and change `CACHE_VERSION` from `v1` to `v2`. That is what
tells her phone to throw away its saved copy. Forget this and she will keep
seeing the previous version indefinitely.
