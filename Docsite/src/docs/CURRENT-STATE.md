# Current State - MDX File Loading System

## What's Working

### ✅ My Dashboard Module - Version 6.1
**Fully functional with MDX file loading**

All 8 pages load real MDX content:
- Overview
- Dashboards
  - Contents
  - Customization
  - Report Actions
  - My Dashboard
    - Contents
- System Icons

**File Location**: `/content/6_1/my-dashboard/*.mdx`

## What Falls Back to Hardcoded Content

### All Other Combinations
For any module/version combination other than My Dashboard 6.1, the system falls back to the existing hardcoded content. This includes:

**Other Versions of My Dashboard:**
- 5.13 → Uses hardcoded content
- 6.1.1 → Uses hardcoded content
- NextGen → Uses hardcoded content

**All Other Modules (any version):**
- Admin → Uses hardcoded content
- CMDB → Uses hardcoded content
- Discovery Scan → Uses hardcoded content
- ITSM → Uses hardcoded content
- Vulnerability Management → Uses hardcoded content
- ITAM → Uses hardcoded content
- Self Service → Uses hardcoded content
- Program & Project Management → Uses hardcoded content
- Risk Register → Uses hardcoded content
- Reports → Uses hardcoded content

## How It Works

```
User navigates to a page
         ↓
resolveMDXPath() is called
         ↓
   Is it My Dashboard 6.1?
         ↓
    YES ↙     ↘ NO
         ↓         ↓
Return MDX    Return null
file path         ↓
    ↓         Fall back to
    ↓         hardcoded content
Load MDX      (existing behavior)
content
```

## Error Prevention

The system now prevents errors by:

1. **Path Resolver Returns Null**: For unsupported combinations, `resolveMDXPath()` returns `null` instead of generating invalid paths
2. **Graceful Fallback**: When null is returned, the app uses existing hardcoded content components
3. **No Breaking Changes**: All existing functionality continues to work exactly as before

## File Structure

```
content/
├── 6_1/
│   └── my-dashboard/          ← MDX files loaded from here
│       ├── dashboards-6_1.mdx
│       ├── dashboards-contents-6_1.mdx
│       ├── dashboards-customization-6_1.mdx
│       ├── dashboards-report-actions-6_1.mdx
│       ├── my-dashboard-6_1.mdx
│       ├── my-dashboard-contents-6_1.mdx
│       ├── my-dashboard-overview-6_1.mdx
│       └── system-icons-6_1.mdx
│
└── [Other directories]        ← Not yet loaded (fall back to hardcoded)
```

## Adding More MDX Content

To add MDX loading for other modules/versions:

### Step 1: Create MDX Files
Place files in the appropriate directory:
```
/content/{version}/{module}/{filename}.mdx
```

Example:
```
/content/NG/cmdb/overview.mdx
/content/6_1/itsm/incidents-6_1.mdx
```

### Step 2: Update Content Loader
In `/content/contentLoader.ts`, add imports:
```typescript
import cmdbOverview from './NG/cmdb/overview.mdx?raw';
```

Add to contentMap:
```typescript
'/content/NG/cmdb/overview.mdx': cmdbOverview,
```

### Step 3: Update Path Resolver
In `/utils/mdxPathResolver.ts`, update `resolveMDXPath()` to handle the new module/version:

```typescript
export function resolveMDXPath({ version, module, section, page }: PathResolverParams): string | null {
  const versionDir = formatVersionForPath(version);
  
  // Special handling for My Dashboard in version 6.1
  if (module === 'my-dashboard' && version === '6.1') {
    return getMyDashboard61Path(page, section);
  }
  
  // Add your new module/version handling here
  if (module === 'cmdb' && version === 'NextGen' && page === 'overview') {
    return '/content/NG/cmdb/overview.mdx';
  }
  
  // Return null for unsupported combinations
  return null;
}
```

### Step 4: Test
1. Navigate to the module/version
2. Verify MDX content loads
3. Check for console errors
4. Test fallback behavior

## Benefits of Current Approach

✅ **No Breaking Changes**: Existing content continues to work  
✅ **Graceful Degradation**: Missing MDX files fall back to hardcoded content  
✅ **Error-Free**: No failed fetch attempts or console errors  
✅ **Incremental Migration**: Can add MDX files gradually  
✅ **Type Safe**: TypeScript ensures all imports are valid  

## Limitations

⚠️ Only My Dashboard 6.1 currently uses MDX files  
⚠️ Other modules require manual implementation  
⚠️ Search doesn't index MDX content yet  
⚠️ Table of contents is static (not extracted from MDX)  

## Testing Status

✅ My Dashboard 6.1 - All 8 pages tested and working  
✅ Version switching - Works correctly  
✅ Module switching - Works correctly  
✅ Error handling - No console errors  
✅ Fallback behavior - Hardcoded content displays for unsupported combinations  

## Next Steps (Optional)

If you want to expand MDX loading to other modules:

1. **Priority Modules** (based on usage):
   - CMDB (all versions)
   - Discovery Scan (all versions)
   - ITSM (all versions)

2. **Other Versions of My Dashboard**:
   - 5.13
   - 6.1.1
   - NextGen

3. **Remaining Modules**:
   - Admin, ITAM, Vulnerability Management, etc.

For each expansion:
- Create MDX files
- Update contentLoader.ts with imports
- Update mdxPathResolver.ts with path logic
- Test thoroughly
