# Vercel Domain Migration Guide

## Problem
Your projects `tada.vercel.app` and `consortio.vercel.app` are on an old Vercel account, but new deployments go to `calma-sigma.vercel.app` on a different account.

## Solution: Migrate Domains to Current Account

### Step 1: Find Your Old Vercel Account

1. **Check all your email addresses** - you may have multiple Vercel accounts
2. Go to [vercel.com](https://vercel.com)
3. **Check the account switcher** (top-left corner, your avatar/team name)
   - Click on it to see all accounts and teams you have access to
   - Look for accounts that have projects named:
     - `tada`
     - `consortio`
     - Or any other missing projects

**Common scenarios:**
- Personal account vs Team account
- Different email (work vs personal)
- Old GitHub connection vs new one

### Step 2: Access Old Projects

Once you find the old account:

1. Switch to that account/team (top-left corner)
2. You should see your old projects:
   - Project with domain `tada.vercel.app`
   - Project with domain `consortio.vercel.app`

### Step 3: Remove Domains from Old Account

For **each project** you want to migrate:

1. Open the project (e.g., `tada`)
2. Go to **Settings** → **Domains**
3. Find the domain you want to migrate (e.g., `tada.vercel.app`)
4. Click **"..."** (three dots) → **"Remove"**
5. Confirm removal

**⚠️ Important:** The domain becomes available immediately after removal.

### Step 4: Add Domains to New Account

1. Switch to your **current Vercel account** (the one with `calma-sigma.vercel.app`)
2. Open the project where you want to add the domain
   - For Tada: project `calma-sigma` or similar
3. Go to **Settings** → **Domains**
4. Click **"Add"**
5. Enter the domain: `tada.vercel.app`
6. Click **"Add"**

Vercel will:
- Verify you're not using it elsewhere (already removed in Step 3)
- Assign it to this project
- Deploy immediately

### Step 5: Set as Production Domain (Optional)

1. In **Settings** → **Domains**
2. Find your new domain `tada.vercel.app`
3. Click **"..."** → **"Set as Production Domain"**
4. This makes it the primary URL (instead of `calma-sigma.vercel.app`)

You can also:
- Remove `calma-sigma.vercel.app` if you don't need it
- Or keep both (one will redirect to the other)

## Alternative: Reconnect Git Integration

If you can't find the old account or prefer to use it:

### Option A: Move GitHub Integration

1. **In old Vercel account:**
   - Project Settings → Git
   - Check it's connected to `chameleoapp/tada`
   - Make sure **Production Branch** = `main`
   - Enable **Auto-deploy**

2. **In new Vercel account:**
   - Delete or disconnect the `calma-sigma` project
   - This prevents conflicts

### Option B: Contact Vercel Support

If domains are "stuck" or you can't access the old account:

1. Go to [vercel.com/help](https://vercel.com/help)
2. Click **"Contact Support"**
3. Explain the situation:
   ```
   Subject: Need help releasing domain tada.vercel.app
   
   Hi Vercel team,
   
   I have domain tada.vercel.app on an old account/project that I can no longer access.
   I need to migrate it to my current account.
   
   Current account: [your email]
   Domain to release: tada.vercel.app
   Target project: [project name or URL]
   
   Can you help release this domain?
   ```

They usually respond within 24 hours and can manually release domains.

## Verification

After migration, verify:

1. **Go to** `https://tada.vercel.app`
2. **Check** that you see the latest version with:
   - New Reima-style clothing images
   - Single card view (one item at a time)
   - Jacket/pants options for winter
   - All recent features

3. **Check deployment logs:**
   ```bash
   # New commits should trigger deployments to tada.vercel.app
   git log --oneline -3
   ```

## Troubleshooting

### "Domain is already in use"
- You didn't remove it from the old account yet
- Go back to Step 3 and remove it

### "Can't find old account"
- Check all email addresses you use
- Look in spam/old emails for Vercel confirmations
- Check GitHub → Settings → Applications → Vercel

### "Domain doesn't update"
- Check Git integration: Settings → Git
- Make sure Production Branch = `main`
- Trigger manual redeploy: Deployments → ... → Redeploy

### "Need to keep both domains"
- You can have multiple domains on one project
- `tada.vercel.app` (production)
- `calma-sigma.vercel.app` (will redirect automatically)

## Quick Reference

**Your current working domains:**
- ✅ `calma-sigma.vercel.app` - currently deploying, all features work
- ✅ `train-your-unicorn.vercel.app` - unicornrising project

**Domains to migrate:**
- 🔄 `tada.vercel.app` - needs migration
- 🔄 `consortio.vercel.app` - needs migration (if you have this project)

**GitHub Repository:**
- `chameleoapp/tada` - connected to new Vercel account

## Need Help?

If you get stuck at any step, you can:
1. Take screenshots of what you see in Vercel
2. Check which projects show up in each account
3. Contact me with the screenshots

The most common issue is just finding which account/team has the old projects. Once you find them, the domain transfer takes 2 minutes!
