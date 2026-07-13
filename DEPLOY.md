# Deploying the AC In-Water Boat Show site

The project is already built, committed to git, and the Vercel CLI is installed.
You just need to log in (once) and deploy. Do this in a normal terminal window
(PowerShell) — the login opens your browser, which an assistant can't do for you.

## First-time deploy

1. Open **PowerShell** and go to the project:
   ```powershell
   cd C:\Users\jon\dev\vbs-website
   ```

2. Log in to Vercel (opens a browser — sign up with email or GitHub, it's free):
   ```powershell
   vercel login
   ```

3. Deploy. The first run asks a few setup questions — **press Enter to accept
   every default** (link to a new project, keep the name `vbs-website`, etc.):
   ```powershell
   vercel
   ```
   This gives you a preview URL like `https://vbs-website-xxxx.vercel.app`.

4. Publish the production version (this is the URL you share):
   ```powershell
   vercel --prod
   ```

That's it — the site is live on a free `*.vercel.app` URL.

## Redeploying after changes

Any time you change the site, from the project folder:
```powershell
vercel --prod
```

## Later
- **Custom domain:** in the Vercel dashboard → your project → Settings → Domains.
- **CRM:** wire the forms in `app/api/leads/route.ts` (single file; see its TODO).
- **Real assets:** replace `public/buoy-ring-logo.svg` and drop in real boat photos.
