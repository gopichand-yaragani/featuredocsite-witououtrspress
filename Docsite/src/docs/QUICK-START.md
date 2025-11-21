# Quick Start - MDX File Loading System

## What Was Implemented

Your Virima documentation site now loads real MDX files for the **My Dashboard** module in **version 6.1**. When users navigate through the documentation, they see the actual content from your MDX files instead of placeholder text.

## How to Use It

1. **Select Version**: Choose **6.1** from the version dropdown
2. **Select Module**: Click on **My Dashboard** from the module selector
3. **Navigate**: Click through the navigation tree to view different pages

## Available Pages

```
My Dashboard (6.1)
├── Overview ✓
├── Dashboards ✓
│   ├── Contents ✓
│   ├── Customization ✓
│   ├── Report Actions ✓
│   └── My Dashboard ✓
│       └── Contents ✓
└── System Icons ✓
```

All 8 pages have content loaded from actual MDX files.

## File Locations

All MDX files are in: `/content/6_1/my-dashboard/`

Files:
- `my-dashboard-overview-6_1.mdx`
- `dashboards-6_1.mdx`
- `dashboards-contents-6_1.mdx`
- `dashboards-customization-6_1.mdx`
- `dashboards-report-actions-6_1.mdx`
- `my-dashboard-6_1.mdx`
- `my-dashboard-contents-6_1.mdx`
- `system-icons-6_1.mdx`

## How to Add More Content

### For My Dashboard 6.1 (already set up):

1. Create new MDX file in `/content/6_1/my-dashboard/`
2. Add import to `/content/contentLoader.ts`:
   ```typescript
   import myNewPage from './6_1/my-dashboard/my-new-page-6_1.mdx?raw';
   ```
3. Add to contentMap in same file:
   ```typescript
   '/content/6_1/my-dashboard/my-new-page-6_1.mdx': myNewPage,
   ```
4. Add navigation entry in `/components/DocumentationLayout.tsx`
5. Add mapping in `/utils/mdxPathResolver.ts`

### For Other Modules (CMDB, Discovery Scan, etc.):

1. Create MDX files in `/content/6_1/{module-name}/`
2. Import them in `/content/contentLoader.ts`
3. Add path resolution logic in `/utils/mdxPathResolver.ts`
4. Update navigation in `/components/DocumentationLayout.tsx`

## Key Files

| File | Purpose |
|------|---------|
| `/content/contentLoader.ts` | Imports and maps all MDX files |
| `/components/MDXContent.tsx` | Renders MDX content with styling |
| `/utils/mdxPathResolver.ts` | Resolves navigation to file paths |
| `/components/DocumentationLayout.tsx` | Navigation structure |
| `/components/DocumentationContent.tsx` | Main content renderer |

## Technical Details

- **Import Method**: Static imports using `?raw` syntax
- **Rendering**: `react-markdown` with custom styling
- **Styling**: Tailwind CSS classes for consistent look
- **Code Highlighting**: `react-syntax-highlighter` for code blocks

## What's Different from Before

**Before**: All content was hardcoded in React components  
**After**: Content is loaded from MDX files

**Benefits**:
- ✅ Content editors can update MDX files directly
- ✅ No need to modify React code for content changes
- ✅ Content is version-controlled
- ✅ Fast loading (bundled with app)
- ✅ Consistent formatting across all pages

## Testing

To verify everything works:

1. Set version to **6.1**
2. Navigate to **My Dashboard**
3. Click through each page in the navigation
4. Verify content loads without errors
5. Check that "Contents" under "Dashboards" is different from "Contents" under "My Dashboard"

## Support

If you encounter any issues:

1. Check browser console for errors
2. Verify the file path in error message
3. Ensure the file exists in `/content/6_1/my-dashboard/`
4. Confirm the file is imported in `contentLoader.ts`
5. Check that the path mapping exists in `mdxPathResolver.ts`

## Next Steps

Now that the system is working for My Dashboard 6.1, you can:

1. Add more pages to My Dashboard 6.1
2. Implement MDX loading for other modules
3. Add content for other versions (5.13, 6.1.1, NextGen)
4. Enhance with features like:
   - Dynamic table of contents extraction
   - Search across MDX content
   - Related pages suggestions
   - Version comparison views
