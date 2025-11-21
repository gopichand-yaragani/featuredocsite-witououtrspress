# Testing Checklist - My Dashboard 6.1 MDX Loading

## Pre-Testing Setup
- [ ] Ensure version is set to **6.1**
- [ ] Navigate to **My Dashboard** module
- [ ] Verify sidebar navigation appears

## Page Loading Tests

### Level 1 - Direct Pages
- [ ] **Overview** page loads correctly
  - Expected file: `my-dashboard-overview-6_1.mdx`
  - Should show: Dashboards overview with Home, User-Specific, and Function-Specific sections
  
- [ ] **Dashboards** page loads correctly
  - Expected file: `dashboards-6_1.mdx`
  - Should show: Comprehensive dashboard documentation with features, types, and management

- [ ] **System Icons** page loads correctly
  - Expected file: `system-icons-6_1.mdx`
  - Should show: System icons documentation with navigation and common icons

### Level 2 - Dashboards Subpages
- [ ] **Dashboards > Contents** loads correctly
  - Expected file: `dashboards-contents-6_1.mdx`
  - Page ID: `dashboards-contents`
  
- [ ] **Dashboards > Customization** loads correctly
  - Expected file: `dashboards-customization-6_1.mdx`
  - Page ID: `customization`
  
- [ ] **Dashboards > Report Actions** loads correctly
  - Expected file: `dashboards-report-actions-6_1.mdx`
  - Page ID: `report-actions`

### Level 3 - Nested My Dashboard
- [ ] **Dashboards > My Dashboard** loads correctly
  - Expected file: `my-dashboard-6_1.mdx`
  - Page ID: `my-dashboard-section`
  
- [ ] **Dashboards > My Dashboard > Contents** loads correctly
  - Expected file: `my-dashboard-contents-6_1.mdx`
  - Page ID: `my-dashboard-contents`
  - **Important**: Should NOT load `dashboards-contents-6_1.mdx`

## Navigation Tests

### Sidebar Navigation
- [ ] Clicking "My Dashboard" section expands/collapses properly
- [ ] Clicking "Dashboards" page expands/collapses subpages
- [ ] Clicking "My Dashboard" (nested) expands/collapses its subpage
- [ ] Active page is highlighted in green
- [ ] Clicking any page navigates to correct content

### Breadcrumb Navigation
- [ ] Breadcrumbs display correct hierarchy for each page
- [ ] Example for "Dashboards > Contents": Home > My Dashboard > Dashboards > Contents
- [ ] Example for nested: Home > My Dashboard > Dashboards > My Dashboard > Contents

### Default Behavior
- [ ] Clicking "My Dashboard" module defaults to "Overview" page
- [ ] Version selector shows "6.1" correctly
- [ ] Module selector shows "My Dashboard" correctly

## Content Rendering Tests

### Markdown Elements
- [ ] H1 headers render with proper styling (dark slate, large size)
- [ ] H2 headers render with proper styling (dark slate, medium size, margin-top)
- [ ] H3 headers render with proper styling
- [ ] Paragraphs render with slate-600 color and proper line height
- [ ] Lists (ul/ol) render with proper spacing
- [ ] Links render in emerald color with hover effect
- [ ] Bold text renders in slate-900

### Special Content
- [ ] Code blocks have syntax highlighting (if present)
- [ ] Tables render with borders and proper styling (if present)
- [ ] Blockquotes have emerald left border (if present)

## Error Handling Tests

### Invalid Paths
- [ ] Navigating to non-existent page shows friendly error message
- [ ] Error message includes the attempted file path
- [ ] Error message is styled in amber/yellow (warning color)

### Version Changes
- [ ] Changing from 6.1 to another version handles gracefully
- [ ] Changing back to 6.1 restores correct content

## Performance Tests

### Loading Speed
- [ ] Content loads instantly (no network delay)
- [ ] No visible loading spinner for valid content
- [ ] Page transitions are smooth

### Browser Console
- [ ] No console errors when loading pages
- [ ] No console warnings about missing content
- [ ] Navigation changes log correctly (if debugging enabled)

## Cross-Browser Tests
- [ ] Chrome/Edge: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work

## Responsive Design
- [ ] Mobile view: Sidebar can be toggled
- [ ] Tablet view: Content is readable
- [ ] Desktop view: Three-column layout works

## Edge Cases

### Rapid Navigation
- [ ] Quickly clicking between pages doesn't break
- [ ] Content updates correctly even with rapid clicks

### Deep Linking
- [ ] Refreshing on a nested page maintains state (if applicable)
- [ ] Back button navigation works correctly

## Success Criteria

✅ All 8 My Dashboard 6.1 pages load correctly  
✅ No fetch errors in console  
✅ Navigation is smooth and responsive  
✅ Content displays with proper formatting  
✅ Unique page IDs prevent collision between "Contents" pages  
✅ Error messages are helpful when content is missing  

## Known Limitations

- Currently only My Dashboard 6.1 has MDX file loading implemented
- Other modules/versions still use hardcoded content
- Search functionality doesn't index MDX content yet
- Table of contents is static (doesn't extract from MDX headings)

## Next Steps for Future Iterations

1. Implement MDX loading for other modules (CMDB, Discovery Scan, etc.)
2. Add MDX content for versions 5.13, 6.1.1, and NextGen
3. Extract TOC dynamically from MDX headings
4. Implement search across MDX content
5. Add related pages functionality
6. Implement versioned breadcrumbs
