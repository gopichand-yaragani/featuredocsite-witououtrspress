# GitHub Actions Workflows

This repository includes GitHub Actions workflows for automated testing and deployment.

## Workflows

### 1. `deploy.yml` - Build, Test, and Deploy

**Triggers:**
- Push to `main` or `master` branch
- Pull requests to `main` or `master`
- Manual workflow dispatch

**Jobs:**
- **Test**: Builds the project and verifies the build output
- **Deploy**: Deploys to GitHub Pages (only on main/master branch pushes)

**Features:**
- ✅ TypeScript type checking
- ✅ Build verification
- ✅ Build size monitoring
- ✅ Automatic deployment to GitHub Pages

### 2. `test.yml` - Test and Lint

**Triggers:**
- Pull requests
- Push to `main` or `master` branch
- Manual workflow dispatch

**Jobs:**
- **Test**: Comprehensive testing across multiple Node.js versions (18, 20)

**Features:**
- ✅ Multi-version Node.js testing
- ✅ TypeScript type checking
- ✅ Build artifact verification
- ✅ HTML validation
- ✅ Build size checks
- ✅ Artifact upload on failure

## Setup Instructions

### Initial GitHub Pages Setup

1. **Enable GitHub Pages:**
   - Go to your repository Settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions" (not "Deploy from a branch")
   - Click "Save"

2. **Repository Permissions:**
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
   - Click "Save"

3. **Push to Main Branch:**
   - The workflow will automatically run on push to `main` or `master`
   - Check the "Actions" tab to see the workflow progress
   - Once complete, your site will be available at: `https://[username].github.io/[repository-name]`

### Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file to the `build` directory (or create it in the root and copy it during build)
2. Configure your domain's DNS settings
3. Update the workflow to handle the CNAME file

## Workflow Details

### Build Process

The workflows:
1. Checkout the repository
2. Setup Node.js (version 20)
3. Install dependencies with `npm ci`
4. Run TypeScript type checking (if `tsconfig.json` exists)
5. Build the project with `npm run build`
6. Verify build artifacts exist
7. Deploy to GitHub Pages (deploy workflow only)

### Build Output

The build process creates a `build` directory containing:
- `index.html` - Main HTML file
- `assets/` - JavaScript, CSS, and other assets
- Other static files

### Monitoring

- **Build Size**: The workflow reports build size and warns if it exceeds 50MB
- **File Count**: Total number of files in the build output
- **Artifacts**: Build artifacts are uploaded on test failures for debugging

## Troubleshooting

### Build Fails

1. Check the workflow logs in the "Actions" tab
2. Verify all dependencies are in `package.json`
3. Ensure `vite.config.ts` is correctly configured
4. Check for TypeScript errors

### Deployment Fails

1. Verify GitHub Pages is enabled with "GitHub Actions" as the source
2. Check repository permissions (Settings → Actions → General)
3. Ensure the workflow has `pages: write` permission
4. Verify the build job completed successfully

### TypeScript Errors

If TypeScript errors are blocking:
- Fix the errors in your code
- Or temporarily disable type checking by removing `tsconfig.json` (not recommended)

### Build Size Issues

If build size is too large:
- Check for unnecessary dependencies
- Optimize images and assets
- Consider code splitting
- Review bundle size with `npm run build -- --analyze` (if configured)

## Manual Testing

To test the build locally:

```bash
# Install dependencies
npm ci

# Build the project
npm run build

# Verify build output
ls -la build/
```

## Workflow Status Badge

Add this to your README.md to show workflow status:

```markdown
![Build Status](https://github.com/[username]/[repository]/actions/workflows/deploy.yml/badge.svg)
```

Replace `[username]` and `[repository]` with your actual values.

## Next Steps

- [ ] Enable GitHub Pages in repository settings
- [ ] Configure repository permissions
- [ ] Push to main branch to trigger first deployment
- [ ] Verify the site is accessible
- [ ] (Optional) Set up a custom domain

