# GitHub Pages Deployment Guide - Step by Step

This guide will walk you through deploying your Virima Documentation website to GitHub Pages.

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ GitHub repository created
- ✅ Code pushed to the repository
- ✅ GitHub Actions workflows created (`.github/workflows/deploy.yml`)
- ✅ Build process working locally (`npm run build` succeeds)

---

## Step 1: Enable GitHub Pages

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click on **"Settings"** tab (top right of repository page)

2. **Access Pages Settings**
   - In the left sidebar, scroll down and click **"Pages"**

3. **Configure Source**
   - Under **"Source"** section, you'll see a dropdown
   - **IMPORTANT**: Select **"GitHub Actions"** (NOT "Deploy from a branch")
   - This allows the workflow to deploy automatically

4. **Save Settings**
   - Click **"Save"** button
   - You should see a message confirming Pages is enabled

**Expected Result**: You'll see a message like "Your site is ready to be published at `https://[username].github.io/[repository-name]`"

---

## Step 2: Configure Repository Permissions

GitHub Actions needs proper permissions to deploy to Pages.

**Important**: This setting is NOT in the Pages section. Follow these exact steps:

1. **Navigate to Actions Settings**
   - You should already be in the **Settings** tab
   - In the left sidebar, look under **"Code and automation"** section
   - Click **"Actions"** (it has a dropdown arrow next to it)
   - Then click **"General"** (this appears under Actions)

2. **Find Workflow Permissions Section**
   - Scroll down the page
   - Look for the section titled **"Workflow permissions"**
   - It's located below other settings like "Actions permissions" and "Fork pull request workflows"

3. **Set Workflow Permissions**
   - You'll see radio buttons for permissions
   - Select **"Read and write permissions"** (NOT "Read repository contents and packages permissions")
   - ✅ Check the box below: **"Allow GitHub Actions to create and approve pull requests"**

4. **Save Changes**
   - Scroll to the bottom of the page
   - Click the **"Save"** button
   - You should see a confirmation message

**Navigation Path:**
```
Settings → Actions → General → Scroll down to "Workflow permissions"
```

**Why this is needed**: The deployment workflow needs write access to deploy artifacts to GitHub Pages. Without this, the deployment step will fail with permission errors.

---

## Step 3: Push Code to Main Branch

The workflow triggers on push to `main` or `master` branch.

1. **Check Your Branch**
   ```bash
   git branch
   ```
   - Ensure you're on `main` or `master` branch
   - If not, switch: `git checkout main`

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Initial commit for GitHub Pages deployment"
   git push origin main
   ```

3. **Verify Push**
   - Go to your repository on GitHub
   - You should see your latest commit

---

## Step 4: Monitor Workflow Execution

1. **Check Actions Tab**
   - Click on **"Actions"** tab in your repository
   - You should see workflows running:
     - `Build, Test, and Deploy` workflow
     - `Test and Lint` workflow

2. **Monitor Progress**
   - Click on the running workflow to see details
   - Watch for:
     - ✅ Green checkmarks = Success
     - ❌ Red X = Failure (check logs)

3. **Expected Workflow Steps**
   - Checkout repository
   - Setup Node.js
   - Install dependencies
   - Build project
   - Deploy to GitHub Pages

4. **Wait for Completion**
   - First deployment may take 3-5 minutes
   - Subsequent deployments are faster (1-2 minutes)

---

## Step 5: Verify Deployment

1. **Check Deployment Status**
   - In the **Actions** tab, click on the completed workflow
   - Look for the **"Deploy to GitHub Pages"** step
   - Should show: ✅ "Deploy to GitHub Pages"

2. **Access Your Site**
   - Go to: `https://[username].github.io/[repository-name]`
   - Example: `https://GopichandY.github.io/FeatureDocsite`
   - **Note**: It may take 1-2 minutes after deployment completes for the site to be accessible

3. **Test Functionality**
   - ✅ Homepage loads
   - ✅ Navigation works
   - ✅ Content pages load
   - ✅ Links work correctly

---

## Step 6: Update Build Status Badge

1. **Get Your Repository URL**
   - Format: `https://github.com/[username]/[repository-name]`
   - Example: `https://github.com/GopichandY/FeatureDocsite`

2. **Update README_6_1.md**
   - Open `README_6_1.md`
   - Find the badge line:
     ```markdown
     ![Build Status](https://github.com/[username]/[repository]/actions/workflows/deploy.yml/badge.svg)
     ```
   - Replace `[username]` and `[repository]` with your actual values
   - Example:
     ```markdown
     ![Build Status](https://github.com/GopichandY/FeatureDocsite/actions/workflows/deploy.yml/badge.svg)
     ```

3. **Commit and Push**
   ```bash
   git add README_6_1.md
   git commit -m "Update build status badge with repository URL"
   git push origin main
   ```

---

## Step 7: Configure Base Path (If Needed)

**Only needed if your repository is NOT at the root of GitHub Pages**

If your site URL is something like:
- `https://[username].github.io/[repository-name]/` (with trailing slash)
- Or you're using a custom domain

You may need to configure the base path in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/repository-name/', // Add this line
  // ... rest of config
});
```

**For most cases, this is NOT needed** - GitHub Pages handles it automatically.

---

## Troubleshooting

### Issue: Workflow Fails

**Check:**
1. ✅ Repository permissions are set correctly (Step 2)
2. ✅ GitHub Pages is enabled with "GitHub Actions" source (Step 1)
3. ✅ Build succeeds locally: `npm run build`
4. ✅ Check workflow logs in Actions tab for specific errors

**Common Errors:**
- **Permission denied**: Re-check Step 2 (Workflow permissions)
- **Build fails**: Check for TypeScript errors or missing dependencies
- **Deploy fails**: Ensure Pages is enabled with "GitHub Actions" source

### Issue: Site Not Accessible

**Check:**
1. ✅ Wait 1-2 minutes after deployment completes
2. ✅ Clear browser cache
3. ✅ Try incognito/private browsing mode
4. ✅ Check if URL is correct: `https://[username].github.io/[repository-name]`
5. ✅ Verify deployment succeeded in Actions tab

### Issue: 404 Errors

**Possible Causes:**
1. Base path not configured (see Step 7)
2. Routes not configured correctly in React Router
3. Build output structure issue

**Solution:**
- Check `vite.config.ts` for base path
- Verify React Router configuration
- Check build output structure

---

## Optional: Custom Domain Setup

If you want to use a custom domain:

1. **Add CNAME File**
   - Create `public/CNAME` file (or add to `build/` directory)
   - Add your domain: `docs.yourdomain.com`

2. **Update Vite Config**
   ```typescript
   export default defineConfig({
     base: '/', // or your subdirectory
     // ...
   });
   ```

3. **Configure DNS**
   - Add CNAME record pointing to `[username].github.io`
   - Or A records pointing to GitHub IPs

4. **Update GitHub Pages Settings**
   - In Pages settings, add your custom domain
   - Enable "Enforce HTTPS"

---

## Quick Reference Checklist

Use this checklist to ensure everything is set up:

- [ ] Step 1: GitHub Pages enabled with "GitHub Actions" source
- [ ] Step 2: Workflow permissions set to "Read and write"
- [ ] Step 3: Code pushed to main/master branch
- [ ] Step 4: Workflow runs successfully in Actions tab
- [ ] Step 5: Site accessible at `https://[username].github.io/[repository]`
- [ ] Step 6: Build status badge updated in README
- [ ] Step 7: Base path configured (if needed)

---

## Post-Deployment

### Monitor Deployments

- Check **Actions** tab regularly
- Monitor build times and sizes
- Review any failed deployments

### Update Content

1. Make changes to MDX files or code
2. Commit and push to main branch
3. Workflow automatically rebuilds and redeploys
4. Site updates within 1-2 minutes

### Performance Tips

- Keep build size under 50MB (workflow warns if exceeded)
- Optimize images and assets
- Use code splitting for large bundles
- Monitor bundle size in build logs

---

## Support

If you encounter issues:

1. Check workflow logs in Actions tab
2. Review this guide's troubleshooting section
3. Verify all prerequisites are met
4. Check GitHub Pages documentation: https://docs.github.com/en/pages

---

## Summary

Your site will be live at:
**`https://[username].github.io/[repository-name]`**

The workflow will automatically:
- ✅ Test the build on every push
- ✅ Deploy to GitHub Pages on main branch
- ✅ Update the site within 1-2 minutes

**Congratulations! Your documentation site is now live! 🎉**

