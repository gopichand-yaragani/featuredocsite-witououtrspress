# Virima Documentation Style Rules Guide

**Version:** 1.1  
**Last Updated:** December 2024  
**Purpose:** Single source of truth for all visual and structural standards across the Virima documentation site

---

## Table of Contents

1. [Virima Theme Colors](#virima-theme-colors)
2. [Active Navigation Highlighting](#active-navigation-highlighting)
3. [Breadcrumb Navigation](#breadcrumb-navigation)
4. [Left Navigation Sidebar](#left-navigation-sidebar)
5. ["On This Page" Table of Contents](#on-this-page-table-of-contents)
6. [Content Typography](#content-typography)
7. [Headings and Section Structure](#headings-and-section-structure)
8. [Links and Interactive Elements](#links-and-interactive-elements)
9. [Buttons and UI Components](#buttons-and-ui-components)
10. [Spacing and Layout](#spacing-and-layout)
11. [Special Content Elements](#special-content-elements)
12. [Section Detection and Breadcrumb Logic](#section-detection-and-breadcrumb-logic)
13. [CSS Class Reference](#css-class-reference)

---

## Virima Theme Colors

### Primary Colors

**Green (Primary Brand Color)**
- `text-green-600` - Primary green text color
- `bg-green-50` - Light green background (for active states, highlights)
- `bg-green-500` - Medium green (for buttons, accents)
- `bg-green-600` - Standard green (for primary buttons)
- `border-green-200` - Light green border
- `border-green-300` - Medium green border (hover states)
- `hover:text-green-600` - Green text on hover

**Emerald (Secondary Accent)**
- `text-emerald-600` - Emerald text (for links, breadcrumbs)
- `hover:text-emerald-700` - Darker emerald on hover
- `border-emerald-500` - Emerald border
- `border-emerald-600` - Standard emerald border
- `focus:ring-emerald-500` - Focus ring color

**Slate (Neutral Grays)**
- `text-slate-600` - Standard body text
- `text-slate-700` - Darker text (metadata, labels)
- `text-slate-900` - Darkest text (headings, emphasis)
- `text-slate-500` - Lighter text (icons, secondary info)
- `bg-slate-50` - Light gray background (hover states)
- `bg-slate-100` - Medium light gray background
- `border-slate-200` - Light gray borders
- `border-slate-200/60` - Semi-transparent gray borders

**Black Premium**
- `text-black-premium` - Premium black text (section titles, emphasis)
- `border-black-premium` - Premium black borders

### Color Usage Rules

✅ **DO:**
- Use `green-600` for active navigation items
- Use `green-50` background for active states
- Use `emerald-600` for clickable links in content
- Use `slate-600` for body text
- Use `slate-900` for headings

❌ **DON'T:**
- Mix different shades of green inconsistently
- Use emerald for navigation (use green instead)
- Use pure black (`text-black`) - use `text-black-premium` or `text-slate-900`

---

## Active Navigation Highlighting

### Universal Rule

**All active navigation items across the entire documentation site must use the Virima theme highlight:**

```
text-green-600 bg-green-50 font-semibold
```

### Application Levels

This styling applies to:
1. **Direct Pages** - Top-level pages in each section
2. **SubPages** - Pages nested under parent pages
3. **Nested SubPages** - Pages nested 3 levels deep

### Inactive State

Non-active navigation items use:
```
text-slate-600 hover:text-black-premium hover:bg-slate-50
```

### Examples

**Active Navigation Item:**
- Text: Green (`text-green-600`)
- Background: Light green (`bg-green-50`)
- Font Weight: Semi-bold (`font-semibold`)
- No border or extra padding

**Inactive Navigation Item:**
- Text: Gray (`text-slate-600`)
- Background: Transparent (white)
- Hover: Darker text (`hover:text-black-premium`) with light gray background (`hover:bg-slate-50`)

### Coverage

✅ **Applied Universally:**
- All modules (My Dashboard, CMDB, Discovery Scan, ITSM, ITAM, Self Service, Program/Project Management, Risk Register, Reports, Vulnerability Management, Admin)
- All versions (NextGen, 6.1.1, 6.1, 5.13)
- All navigation levels (Direct, SubPages, Nested SubPages)

---

## Breadcrumb Navigation

### Structure

**Standard Format:**
```
Home > Version > Module > Section > Parent Topic > Nested > Page
```

### Styling

**Breadcrumb Container:**
- Container: `flex flex-col gap-3 mb-8 not-prose`
- Background: White (no background)
- Spacing: 12px gap between items, 32px bottom margin

**Breadcrumb Links (Clickable):**
- Text: `text-slate-700`
- Hover: `hover:text-emerald-600`
- Cursor: `cursor-pointer`
- Transition: `transition-colors`

**Breadcrumb Separator:**
- Uses `<BreadcrumbSeparator />` component
- Automatic spacing

**Current Page (Non-clickable):**
- Text: `text-slate-900`
- Uses `<BreadcrumbPage>` component
- No hover effect

**Home Icon:**
- Size: `w-4 h-4`
- Color: Inherits from parent link color

### Behavior Rules

✅ **DO:**
- Show full hierarchy path (7 levels when applicable)
- Make all parent levels clickable
- Use emerald green for hover states
- Show current page as non-clickable dark text
- **Detect actual section based on page content** (e.g., Getting Started pages under My Dashboard should show "Getting Started" as the section, not "My Dashboard")
- **Stop at the deepest valid level** - don't repeat parent nodes or insert placeholders

❌ **DON'T:**
- Skip hierarchy levels
- Make current page clickable
- Use different colors for breadcrumb links
- Add backgrounds or borders to breadcrumbs
- **Repeat parent nodes** (e.g., don't show "My Dashboard > My Dashboard")
- **Skip intermediate sections** (e.g., don't skip "Getting Started" when showing Installation page)

### Special Cases

**Getting Started Pages:**
- Pages: `quick-start`, `installation`, `configuration`, `first-steps`
- **Breadcrumb Rule:** When these pages are under My Dashboard module, the breadcrumb must show:
  - `Home > Version > My Dashboard > Getting Started > [Page Name]`
- **NOT:** `Home > Version > My Dashboard > My Dashboard > [Page Name]`
- **Implementation:** The system automatically detects Getting Started pages and sets `actualSection = 'getting-started'` for breadcrumb rendering

**Application Overview Pages:**
- Pages: `system-icons`, `user-specific-functions`, `online-help`, and all Shared Functions pages
- **Breadcrumb Rule:** When these pages are under My Dashboard module, the breadcrumb must show:
  - `Home > Version > My Dashboard > Application Overview > [Page Name]` (or `> Shared Functions > [Page Name]` if applicable)
- **Implementation:** The system automatically detects Application Overview pages and sets `actualSection = 'application-overview'` for breadcrumb rendering

---

## Left Navigation Sidebar

### Container

**Sidebar:**
- Width: `w-72` (288px)
- Background: `bg-white`
- Border: `border-r border-slate-200/60`
- Position: Fixed on mobile, static on desktop
- Z-index: `z-40`

**Scroll Area:**
- Uses `<ScrollArea>` component
- Height: `h-full`
- Padding: `py-8 px-6`

### Module Selector

**Label:**
- Text: `text-xs text-slate-500 mb-2 block`

**Select Dropdown:**
- Trigger: `w-full h-9 bg-white border-slate-200`
- Background: White
- Border: Light gray

### Section Titles

**Section Button:**
- Active: `text-black-premium`
- Inactive: `text-slate-600 hover:text-black-premium hover:bg-slate-50`
- Padding: `px-2 py-1.5`
- Rounded: `rounded`
- Transition: `transition-colors`

**Section Active State Detection:**
- A section is active if:
  1. It matches `selectedSection` (from URL/state), OR
  2. It contains the currently selected page (checked by searching direct pages, subPages, and nested subPages)
- **Critical Rule:** The section that contains the selected page must be highlighted, even if `selectedSection` points to a different section
- **Example:** When "Installation" (a Getting Started page) is selected, "Getting Started" section must be highlighted, not "My Dashboard"

**Chevron Icons:**
- Size: `h-4 w-4`
- Color: `text-slate-500`
- Expand/Collapse: `ChevronDown` / `ChevronRight`

### Page Navigation Items

**Direct Pages:**
- Active: `text-green-600 bg-green-50 font-semibold`
- Inactive: `text-slate-600 hover:text-black-premium hover:bg-slate-50`
- Size: `text-sm`
- Padding: `py-1.5 px-2`
- Rounded: `rounded`
- Transition: `transition-colors`

**SubPages (Nested Level 1):**
- Same styling as Direct Pages
- Indentation: `ml-8 space-y-1 pl-4 mt-1`
- Parent container spacing

**Nested SubPages (Nested Level 2):**
- Same styling as Direct Pages
- Indentation: `ml-8 space-y-1 pl-4 mt-1`
- Further nested under SubPages

**Expand/Collapse Buttons:**
- Size: `p-1`
- Hover: `hover:bg-slate-100`
- Rounded: `rounded`
- Transition: `transition-colors`
- Chevron size: `h-3 w-3`

### Spacing Rules

- Section spacing: `space-y-2`
- Page spacing: `space-y-1`
- SubPage indentation: `ml-8 pl-4`
- Nested SubPage indentation: `ml-8 pl-4` (within SubPage container)

### Section Detection Logic

**Universal Rule (Applied to All Modules and Versions):**
- The left navigation must identify which section contains the currently selected page
- This is done by searching through:
  1. Direct pages in each section
  2. SubPages (1 level deep)
  3. Nested subPages (2 levels deep)
- The section that contains the selected page is automatically highlighted with `text-black-premium`
- This ensures the correct parent section is always highlighted, regardless of URL structure

**Getting Started Example:**
- When "Installation" page is selected:
  - ✅ "Getting Started" section → Highlighted (bold/black)
  - ✅ "Installation" page → Highlighted (green background + green text + bold)
  - ❌ "My Dashboard" section → Normal (not highlighted)

**Implementation:**
- Uses `normalizePageId()` for case-insensitive matching
- Searches all navigation levels (direct, subPages, nested subPages)
- Updates automatically when `selectedPage` changes

---

## "On This Page" Table of Contents

### Container

**Sidebar:**
- Width: `w-64` (256px)
- Position: `sticky top-20`
- Visibility: `hidden xl:block` (only on extra-large screens)
- Max height: `max-h-[calc(100vh-5rem)]`
- Overflow: `overflow-y-auto`
- Border: `border-l border-slate-200/60`
- Padding: `px-6 py-12 lg:py-16`

### Header

**Title:**
- Text: `text-sm text-black-premium font-semibold`
- Border bottom: `border-b border-slate-200`
- Padding: `pb-4 mb-4`

### TOC Items

**H2 Headings (Main Sections):**
- Active: `text-emerald-600 font-medium`
- Inactive: `text-slate-600 hover:text-slate-900`
- Size: `text-sm`
- Padding: `py-1.5`
- Indentation: `pl-0`
- Focus ring: `focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`
- Rounded: `rounded`

**H3 Headings (Nested Sections):**
- Active: `text-emerald-600 font-medium`
- Inactive: `text-slate-500 hover:text-slate-700`
- Size: `text-sm`
- Padding: `py-1`
- Indentation: `pl-4`
- Focus ring: `focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`
- Rounded: `rounded`

**Container:**
- Spacing: `space-y-1` for H2 items
- Nested spacing: `pl-4 space-y-0.5` for H3 items under H2

### Behavior

✅ **DO:**
- Auto-detect H2 and H3 headings from content
- Highlight active section while scrolling (scroll-spy)
- Use emerald green for active items
- Show nested H3 items indented under H2
- Support smooth scrolling on click

❌ **DON'T:**
- Include H1 or H4+ headings
- Use different colors for active state
- Show headings that don't exist in content
- Break scroll-spy functionality

---

## Content Typography

### Base Content Container

**Article:**
- Class: `prose prose-slate max-w-none`
- Max width: `max-w-4xl`
- Padding: `px-6 lg:px-12 py-12 lg:py-16`

### Body Text

**Paragraphs:**
- Color: `text-slate-600`
- Line height: `leading-relaxed`
- Bottom margin: `mb-4` (standard) or `mb-6` (after headings)

**Standard Paragraph:**
```
text-slate-600 leading-relaxed mb-4
```

**Paragraph After Heading:**
```
text-slate-600 leading-relaxed mb-6
```

### Text Sizes

- Standard: Default (16px base)
- Small: `text-sm` (14px)
- Extra small: `text-xs` (12px)
- Large: `text-lg` (18px)

### Text Colors

- Body: `text-slate-600`
- Headings: `text-slate-900`
- Emphasis: `text-slate-900` (for `<strong>`)
- Secondary: `text-slate-500`
- Metadata: `text-slate-700`

---

## Headings and Section Structure

### H1 (Page Title)

**Styling:**
```
text-slate-900 mb-6 scroll-mt-20
```

**Rules:**
- One H1 per page
- Dark slate color
- Bottom margin: 24px
- Scroll margin: 80px (for anchor links)
- ID attribute: Required for TOC integration

**Example:**
```html
<h1 id="page-title" className="text-slate-900 mb-6 scroll-mt-20">
  Page Title
</h1>
```

### H2 (Main Sections)

**Styling:**
```
mt-12 mb-6
```

**Rules:**
- Top margin: 48px (spacing from previous content)
- Bottom margin: 24px
- ID attribute: Required for TOC
- Color: Inherits from prose (slate-900)

**Example:**
```html
<h2 id="section-name" className="mt-12 mb-6">
  Section Name
</h2>
```

### H3 (Subsections)

**Styling:**
```
mt-8 mb-4
```

**Rules:**
- Top margin: 32px
- Bottom margin: 16px
- ID attribute: Recommended for deep linking
- Color: Inherits from prose (slate-900)

**Example:**
```html
<h3 id="subsection-name" className="mt-8 mb-4">
  Subsection Name
</h3>
```

### Heading Hierarchy Rules

✅ **DO:**
- Use H1 for page title only
- Use H2 for main sections
- Use H3 for subsections under H2
- Add ID attributes for anchor links
- Use `scroll-mt-20` on H1 for proper scroll offset

❌ **DON'T:**
- Skip heading levels (e.g., H1 → H3)
- Use H4+ for content that should be in TOC
- Forget ID attributes on H2/H3
- Use headings for styling only (use CSS classes instead)

---

## Links and Interactive Elements

### Content Links

**Standard Link:**
```
text-emerald-600 hover:text-emerald-700 underline
```

**Rules:**
- Color: Emerald green
- Hover: Darker emerald
- Underline: Always visible
- No background or border

### Breadcrumb Links

**Styling:**
```
text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors
```

**Rules:**
- Default: Slate gray
- Hover: Emerald green
- Smooth color transition
- Pointer cursor

### Navigation Links

See [Active Navigation Highlighting](#active-navigation-highlighting) section.

### Link Behavior

✅ **DO:**
- Use emerald green for content links
- Add hover states
- Use smooth transitions
- Make links clearly clickable

❌ **DON'T:**
- Use blue for links (use emerald)
- Remove underlines from content links
- Make links look like buttons unless they are buttons

---

## Buttons and UI Components

### Primary Button

**Styling:**
```
bg-gradient-to-r from-green-600 to-green-500 
hover:from-green-700 hover:to-green-600 
text-white shadow-lg hover:shadow-xl 
transition-all duration-300
```

**Usage:**
- "Log in" button
- Primary call-to-action buttons

### Secondary Button

**Styling:**
```
text-slate-700 hover:text-green-600
```

**Usage:**
- Navigation links in header
- Secondary actions

### Icon Buttons

**Expand/Collapse:**
```
p-1 hover:bg-slate-100 rounded transition-colors
```

**Menu Toggle:**
```
lg:hidden -ml-2
```

### Select Dropdowns

**Version Selector:**
```
w-28 h-9 bg-white border-2 border-black-premium 
text-black-premium font-semibold
```

**Module Selector:**
```
w-full h-9 bg-white border-slate-200
```

---

## Spacing and Layout

### Container Widths

- **Main Content:** `max-w-4xl` (896px)
- **Sidebar:** `w-72` (288px) for navigation, `w-64` (256px) for TOC
- **Max Container:** `max-w-[1800px]` for full page width

### Padding

**Content Area:**
- Mobile: `px-6 py-12`
- Desktop: `px-6 lg:px-12 py-12 lg:py-16`

**Sidebar:**
- Padding: `px-6 py-8`

**Cards/Boxes:**
- Standard: `p-6`
- Small: `p-4`

### Margins

**Vertical Spacing:**
- Small: `mb-4` (16px)
- Medium: `mb-6` (24px)
- Large: `mb-8` (32px)
- Extra Large: `mb-12` (48px)

**Section Spacing:**
- Between sections: `mt-12` (48px)
- Between subsections: `mt-8` (32px)

### Grid Layouts

**Two Column Grid:**
```
grid grid-cols-1 md:grid-cols-2 gap-6
```

**Rules:**
- Single column on mobile
- Two columns on medium+ screens
- Gap: 24px between items

---

## Special Content Elements

### Info Boxes

**Green Info Box (Version Notice):**
```
bg-green-50 border border-green-200 rounded-lg p-6 mb-12 not-prose
```

**Text:**
```
text-sm text-green-800
```

**Usage:** Version notices, important information

### Blue Info Box (MDX Source):**
```
bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12 not-prose
```

**Text:**
```
text-sm text-blue-900
```

**Code Block:**
```
text-xs bg-blue-100 px-2 py-1 rounded
```

**Usage:** Technical information, file paths

### Feature Cards

**Card Container:**
```
border border-slate-200 rounded-lg p-6 
hover:border-green-300 hover:shadow-md transition-all
```

**Card Heading:**
```
mb-3 text-slate-900
```

**Card Text:**
```
text-sm text-slate-600 leading-relaxed
```

**Usage:** Feature highlights, capability descriptions

### Bullet Points with Accent

**Container:**
```
flex items-start gap-3
```

**Accent Bar:**
```
w-1 h-6 bg-emerald-500 rounded-full mt-0.5
```

**Text:**
```
text-slate-900
```

**Usage:** Key points, feature lists

### Tables

**Table Container:**
```
overflow-x-auto my-6
```

**Table:**
```
min-w-full border-collapse border border-slate-200
```

**Header:**
```
bg-slate-50
```

**Header Cell:**
```
border border-slate-200 px-4 py-2 text-left text-slate-900
```

**Data Cell:**
```
border border-slate-200 px-4 py-2 text-slate-600
```

### Blockquotes

**Styling:**
```
border-l-4 border-emerald-500 pl-4 italic text-slate-600 my-6
```

**Rules:**
- Left border: 4px emerald
- Left padding: 16px
- Italic text
- Slate gray color
- Vertical margin: 24px

---

## CSS Class Reference

### Color Classes

**Green:**
- `text-green-600` - Green text
- `bg-green-50` - Light green background
- `bg-green-500` - Medium green background
- `bg-green-600` - Standard green background
- `border-green-200` - Light green border
- `border-green-300` - Medium green border
- `hover:text-green-600` - Green text on hover

**Emerald:**
- `text-emerald-600` - Emerald text
- `hover:text-emerald-700` - Darker emerald on hover
- `border-emerald-500` - Emerald border
- `border-emerald-600` - Standard emerald border
- `focus:ring-emerald-500` - Emerald focus ring

**Slate:**
- `text-slate-500` - Light gray text
- `text-slate-600` - Standard gray text
- `text-slate-700` - Dark gray text
- `text-slate-900` - Darkest gray text
- `bg-slate-50` - Light gray background
- `bg-slate-100` - Medium light gray background
- `border-slate-200` - Light gray border
- `border-slate-200/60` - Semi-transparent gray border

**Black Premium:**
- `text-black-premium` - Premium black text
- `border-black-premium` - Premium black border

### Typography Classes

**Sizes:**
- `text-xs` - 12px
- `text-sm` - 14px
- `text-base` - 16px (default)
- `text-lg` - 18px

**Weights:**
- `font-semibold` - 600 weight
- `font-medium` - 500 weight

**Line Heights:**
- `leading-relaxed` - 1.625 line height

### Spacing Classes

**Margin Bottom:**
- `mb-4` - 16px
- `mb-6` - 24px
- `mb-8` - 32px
- `mb-12` - 48px

**Margin Top:**
- `mt-8` - 32px
- `mt-12` - 48px

**Padding:**
- `p-1` - 4px
- `p-4` - 16px
- `p-6` - 24px
- `px-2` - 8px horizontal
- `px-4` - 16px horizontal
- `px-6` - 24px horizontal
- `py-1` - 4px vertical
- `py-1.5` - 6px vertical
- `py-2` - 8px vertical
- `py-12` - 48px vertical

**Gaps:**
- `gap-2` - 8px
- `gap-3` - 12px
- `gap-6` - 24px

### Layout Classes

**Display:**
- `flex` - Flexbox
- `flex-col` - Column direction
- `flex-1` - Flex grow
- `hidden` - Hidden
- `block` - Block display

**Position:**
- `sticky` - Sticky positioning
- `fixed` - Fixed positioning
- `relative` - Relative positioning

**Width:**
- `w-64` - 256px
- `w-72` - 288px
- `w-full` - 100%
- `max-w-4xl` - 896px max width
- `max-w-[1800px]` - 1800px max width

**Height:**
- `h-4` - 16px
- `h-5` - 20px
- `h-7` - 28px
- `h-9` - 36px
- `h-full` - 100% height
- `h-screen` - 100vh

### Border Classes

**Width:**
- `border` - 1px
- `border-2` - 2px
- `border-l-4` - 4px left border

**Radius:**
- `rounded` - 4px
- `rounded-lg` - 8px
- `rounded-full` - 9999px

### Effect Classes

**Transitions:**
- `transition-colors` - Color transition
- `transition-all` - All properties transition
- `duration-300` - 300ms duration

**Shadows:**
- `shadow-lg` - Large shadow
- `shadow-xl` - Extra large shadow
- `hover:shadow-md` - Medium shadow on hover
- `hover:shadow-xl` - Extra large shadow on hover

**Backdrop:**
- `backdrop-blur-sm` - Small backdrop blur

### Utility Classes

**Scroll:**
- `scroll-mt-20` - Scroll margin top 80px
- `overflow-x-auto` - Horizontal scroll
- `overflow-y-auto` - Vertical scroll

**Z-index:**
- `z-30` - Z-index 30
- `z-40` - Z-index 40
- `z-50` - Z-index 50

**Not Prose:**
- `not-prose` - Exclude from prose styling

---

## Section Detection and Breadcrumb Logic

### Getting Started Pages

**Page IDs:**
- `quick-start`
- `installation`
- `configuration`
- `first-steps`

**Detection Logic:**
- These pages are automatically detected when under the `my-dashboard` module
- The system sets `actualSection = 'getting-started'` for breadcrumb and navigation purposes
- This applies universally across all versions (NextGen, 6.1.1, 6.1, 5.13)

**Breadcrumb Behavior:**
- **Correct:** `Home > Version > My Dashboard > Getting Started > Installation`
- **Incorrect:** `Home > Version > My Dashboard > My Dashboard > Installation`

**Left Navigation Behavior:**
- When a Getting Started page is selected:
  - "Getting Started" section is highlighted (bold/black text)
  - The selected page is highlighted (green background + green text + bold)
  - Other sections (like "My Dashboard") remain normal

### Application Overview Pages

**Page IDs:**
- `system-icons`
- `user-specific-functions`
- `online-help`
- All Shared Functions pages (e.g., `advanced-search`, `attachments`, etc.)

**Detection Logic:**
- These pages are automatically detected when under the `my-dashboard` module
- The system sets `actualSection = 'application-overview'` for breadcrumb and navigation purposes
- This applies universally across all versions

**Breadcrumb Behavior:**
- **Correct:** `Home > Version > My Dashboard > Application Overview > System Icons`
- **Correct (with parent):** `Home > Version > My Dashboard > Application Overview > Shared Functions > Advanced Search`
- **Incorrect:** `Home > Version > My Dashboard > My Dashboard > System Icons`

### Universal Section Detection

**Rule:**
- The system must always detect the actual section based on page content, not just URL structure
- This ensures breadcrumbs and navigation highlight the correct hierarchy
- Applied universally to all modules and all versions

**Implementation:**
- `mapFileNameToPage()` function in `App.tsx` detects Getting Started and Application Overview pages
- `DocumentationContent.tsx` uses `actualSection` for breadcrumb rendering
- `DocumentationLayout.tsx` searches all sections to find which contains the selected page

---

## Maintenance and Updates

### How to Use This Guide

1. **Before Making Changes:** Review the relevant section in this guide
2. **During Development:** Reference CSS classes from the [CSS Class Reference](#css-class-reference) section
3. **After Changes:** Verify consistency with this guide
4. **When Issues Arise:** Check this guide first to identify deviations

### Updating This Guide

When making style changes:
1. Update the relevant section in this guide
2. Document the change reason
3. Update the "Last Updated" date
4. Ensure all examples are accurate

### Version Control

- Keep this guide in the repository root
- Commit changes with clear messages
- Reference this guide in pull requests for style changes

### Recent Updates (Version 1.1)

**December 2024:**
- Added Getting Started section detection rules
- Added Application Overview section detection rules
- Added section highlighting logic documentation
- Clarified breadcrumb hierarchy rules to prevent duplicate parent nodes
- Documented universal section detection across all modules and versions

---

## Quick Reference Checklist

### Active Navigation Item
- [ ] `text-green-600`
- [ ] `bg-green-50`
- [ ] `font-semibold`
- [ ] No border or extra padding

### Breadcrumb Link
- [ ] `text-slate-700`
- [ ] `hover:text-emerald-600`
- [ ] `cursor-pointer`
- [ ] `transition-colors`

### Content Link
- [ ] `text-emerald-600`
- [ ] `hover:text-emerald-700`
- [ ] `underline`

### H1 Heading
- [ ] `text-slate-900`
- [ ] `mb-6`
- [ ] `scroll-mt-20`
- [ ] Has ID attribute

### H2 Heading
- [ ] `mt-12 mb-6`
- [ ] Has ID attribute
- [ ] Appears in TOC

### Body Paragraph
- [ ] `text-slate-600`
- [ ] `leading-relaxed`
- [ ] `mb-4` or `mb-6`

### TOC Active Item
- [ ] `text-emerald-600`
- [ ] `font-medium`

---

**End of Style Guide**

For questions or clarifications, refer to this document or check the source code in `src/components/` directory.

