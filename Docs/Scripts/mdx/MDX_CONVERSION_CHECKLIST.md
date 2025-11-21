# MDX Conversion Quality Checklist

This document verifies that all improvements requested for high-quality MDX/JSX conversion are implemented in the script.

## ✅ Implemented Features

### 1. BOM Removal
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1734-1780, 2009-2011
- **Details**: 
  - Strips UTF-8 BOM (`\uFEFF`) from HTML source files
  - Writes MDX files without BOM using `UTF8Encoding $false`
  - Removes BOM from markdown content after Pandoc conversion

### 2. Strong Spans Conversion
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1299-1326, 1921-1926
- **Details**:
  - Promotes standalone `<span class="Strong">` blocks to `##` headings
  - Removes `<span class="Strong">` from existing headings (headings are already bold)
  - Converts inline `<span class="Strong">text</span>` → `**text**`
  - Cleans up `<span class="Strong">` in Markdown table cells

### 3. Bullet Divs Conversion
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1105-1119
- **Details**:
  - Converts `<div class="Bullet1">content</div>` → `- content`
  - Converts `<div class="emdash1">content</div>` → `- content`
  - Preserves links and inline Markdown inside divs

### 4. Image Placeholder Conversion
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1071-1103
- **Details**:
  - Detects both `data-original-image-src` and `original-image-src` attributes
  - Converts to Markdown: `![alt](src)`
  - URL-decodes image paths (%20 → spaces)
  - Extracts alt text from filename
  - Preserves width from style attributes

### 5. MadCap Attributes Removal
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1061-1066, 1161-1205
- **Details**:
  - Removes `madcap:*` attributes (including `madcap:autonum`, `madcap:conditions`)
  - Removes `mc-table-style` attributes
  - Removes `data-mc-*` attributes
  - Removes `data-cellspacing` and `data-cellpadding` from tables
  - Removes all `TableStyle-*` classes from table tags (except Note/Warning which are converted to components)

### 6. Note/Warning Table Conversion
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1121-1159
- **Details**:
  - Converts `TableStyle-Note` and `TableStyle-Note-Indent` → `<Note>` component
  - Converts `TableStyle-Warning` and `TableStyle-Warning-Indent` → `<Warning>` component
  - Extracts text from table cells
  - Preserves Markdown images (already converted in step 3)
  - Normalizes whitespace and line breaks

### 7. Heading Hierarchy Normalization
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1885-1918
- **Details**:
  - Ensures only one H1 per file
  - Converts subsequent H1s to H2s
  - Promotes standalone bold lines to H2 headings
  - Maintains proper heading structure

### 8. Table Cleanup
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 955-1053 (Normalize-MarkdownTables), 1920-1933
- **Details**:
  - Removes `<span class="Strong">` from Markdown table cells
  - Removes all HTML spans from table cells
  - Normalizes table headers (replaces blank headers with "Column N")
  - Preserves table alignment markers
  - Ensures consistent table formatting

### 9. Empty HTML Comments Removal
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Line 1069
- **Details**:
  - Removes empty HTML comments: `<!-- -->`
  - Removes whitespace-only comments

### 10. Frontmatter Enforcement
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1995-2007
- **Details**:
  - Ensures every MDX file has frontmatter
  - If missing, creates frontmatter from first H1
  - Includes: title, version, description, module, section, page, breadcrumbs

### 11. HTML to JSX Conversion
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1243-1286
- **Details**:
  - Converts `class` → `className` for remaining HTML tags
  - Converts `style="..."` → `style={{ ... }}` with kebab-case to camelCase
  - Escapes single quotes in style values

### 12. Link Normalization
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1207-1241
- **Details**:
  - Converts `.htm` links to MDX routes using LinkMap
  - Handles case-insensitive matching
  - Falls back to `.mdx` extension if no mapping found

### 13. Common HTML Tag Conversions
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1299-1395
- **Details**:
  - Converts `<p>` tags → paragraphs (removes tags, keeps content)
  - Converts `<strong>` and `<b>` → `**bold**` Markdown
  - Converts `<em>` and `<i>` → `*italic*` Markdown
  - Converts `<br>` and `<br/>` → line breaks (`\r\n`)
  - Converts `<code>` → inline code (backticks)
  - Converts `<pre>` → JSX `<pre>` blocks (cleaned of HTML tags)
  - Converts `<ul>` → Markdown bullet lists (`- item`)
  - Converts `<ol>` → Markdown numbered lists (`1. item`)
  - Converts `<blockquote>` → Markdown blockquotes (`> text`)
  - Converts `<hr>` → horizontal rules (`---`)

### 14. HTML Entity Conversion
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1985-1991
- **Details**:
  - Converts `&nbsp;` → space
  - Converts `&amp;` → `&`
  - Converts `&lt;` → `<`
  - Converts `&gt;` → `>`
  - Converts `&quot;` → `"`
  - Converts `&#39;` → `'`
  - Ensures JSX/MDX compatibility (entities not needed in JSX)

### 15. Whitespace Normalization
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1393-1410, 1993-1995
- **Details**:
  - Normalizes multiple spaces to single space
  - Normalizes multiple blank lines (3+) to double blank lines
  - Preserves intentional spacing in code blocks and tables
  - Ensures clean, readable MDX output

### 16. Empty Tag Removal
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1400-1407
- **Details**:
  - Removes empty `<div>` tags
  - Removes empty `<span>` tags
  - Removes empty `<div class="Bullet1">` tags
  - Removes empty `<span class="image placeholder">` tags
  - Removes any self-closing or empty paired HTML tags
  - Prevents clutter in MDX output

### 17. Aggressive HTML Cleanup (Post-Processing)
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1950-1983
- **Details**:
  - Protects JSX components (`<Note>`, `<Warning>`, etc.) during cleanup
  - Protects table structures during cleanup
  - Removes remaining HTML tags: `<p>`, `<div>`, `<span>`, `<strong>`, `<b>`, `<em>`, `<i>`, `<br>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<hr>`
  - Preserves valid JSX/HTML structures (tables, images, links, code blocks)
  - Ensures final output is clean MDX/JSX

### 18. Quality Validation
- **Status**: ✅ **IMPLEMENTED**
- **Location**: Lines 1444-1520
- **Details**:
  - Checks for remaining `madcap:*` attributes
  - Checks for `mc-table-style` attributes
  - Checks for `image placeholder` spans
  - Checks for `original-image-src` attributes
  - Checks for `TableStyle-*` classes
  - Checks for `<span class="Strong">` tags
  - Checks for `<div class="Bullet1">` or `<div class="emdash1">` tags
  - Validates frontmatter presence
  - Validates no `.htm` links (should be converted)
  - Detects HTML remnants (unconverted HTML tags)
  - Validates unclosed tags (excluding JSX components)

## Processing Order

The script processes content in this order to ensure proper conversion:

1. **Remove MadCap attributes** (step 1)
2. **Remove empty HTML comments** (step 2)
3. **Convert image placeholders** (step 3) - *Must happen before Note table conversion*
4. **Convert Bullet1/emdash1 divs** (step 4)
5. **Convert Note/Warning tables** (step 5) - *Images already in Markdown format*
6. **Clean up HTML tables** (step 6) - *Removes TableStyle-* classes and data-* attributes*
7. **Normalize links** (step 7) - *Converts .htm to MDX routes*
8. **Convert HTML to JSX** (step 8) - *class → className, style → JSX objects*
9. **Convert common HTML tags** (step 9) - *p, strong, em, br, code, pre, ul, ol, blockquote, hr*
10. **Promote standalone Strong spans** (step 10) - *To H2 headings*
11. **Normalize Markdown tables** (step 11) - *Headers, alignment, inline formatting*
12. **Remove empty tags** (step 12) - *Empty divs, spans, etc.*
13. **Remove empty HTML tags** (step 13) - *Self-closing or empty pairs*
14. **Normalize whitespace** (step 14) - *Multiple spaces/lines*
15. **Post-processing cleanup** (steps 15-17) - *HTML entities, aggressive HTML removal, frontmatter enforcement*

## Quality Checks Performed

The script validates that:
- ✅ No BOM characters remain
- ✅ No `madcap:*` attributes remain
- ✅ No `mc-table-style` attributes remain
- ✅ No `data-cellspacing` or `data-cellpadding` remain
- ✅ No `image placeholder` spans remain
- ✅ No `original-image-src` attributes remain
- ✅ No `TableStyle-*` classes remain (except in validation, Note/Warning are converted)
- ✅ No `<span class="Strong">` tags remain
- ✅ No `<div class="Bullet1">` or `<div class="emdash1">` tags remain
- ✅ No common HTML tags remain (`<p>`, `<div>`, `<span>`, `<strong>`, `<b>`, `<em>`, `<i>`, `<br>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<hr>`)
- ✅ No HTML entities remain (`&nbsp;`, `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`)
- ✅ Frontmatter is present in every file
- ✅ No `.htm` links remain (all converted to `.mdx` routes)
- ✅ Only one H1 per file
- ✅ Markdown tables are properly formatted
- ✅ Whitespace is normalized (no excessive spaces or blank lines)
- ✅ No empty HTML tags remain

## Additional MDX/JSX Compatibility Features

### HTML to Markdown Conversions
- ✅ **Paragraphs**: `<p>` tags removed, content preserved as paragraphs
- ✅ **Bold/Italic**: `<strong>`, `<b>` → `**bold**`; `<em>`, `<i>` → `*italic*`
- ✅ **Line Breaks**: `<br>` → line breaks (`\r\n`)
- ✅ **Code**: `<code>` → inline code (backticks); `<pre>` → JSX code blocks
- ✅ **Lists**: `<ul>` → Markdown bullet lists; `<ol>` → Markdown numbered lists
- ✅ **Blockquotes**: `<blockquote>` → Markdown blockquotes (`> text`)
- ✅ **Horizontal Rules**: `<hr>` → Markdown horizontal rules (`---`)

### JSX Attribute Conversions
- ✅ **class → className**: All remaining HTML tags with `class` converted to `className`
- ✅ **style → JSX objects**: Inline `style="..."` converted to `style={{ ... }}` with:
  - Kebab-case to camelCase (e.g., `background-color` → `backgroundColor`)
  - Proper value quoting and escaping
  - Support for multiple style properties

### Content Cleanup
- ✅ **HTML Entities**: All common entities converted to characters
- ✅ **Whitespace**: Multiple spaces/lines normalized for readability
- ✅ **Empty Tags**: All empty HTML tags removed
- ✅ **Protected Structures**: JSX components and tables protected during aggressive cleanup

## Known Limitations

1. **Link Routing**: The script converts `.htm` to `.mdx` routes, but full routing map requires manual configuration
2. **Image Alt Text**: Currently derived from filename; could be enhanced with context-aware alt text
3. **Ordered Lists**: Bullet lists remain as `-`; automatic conversion to numbered lists (`1.`, `2.`) requires heuristics
4. **Table Content**: Note/Warning table conversion extracts text; complex nested structures may need manual review
5. **Complex JSX**: Very complex nested HTML structures may require manual review for optimal MDX output

## Testing Recommendations

Test the script with these sample files to verify all improvements:
- `admin_functions_new_6_1.mdx`
- `admin_functions_v6_6_1.mdx`
- `access_cmdb_6_1.mdx`
- `attachments_6_1.mdx`
- `audits_6_1.mdx`

Expected results:
- ✅ No BOM at file start
- ✅ All `<span class="Strong">` converted to `**bold**` or headings
- ✅ All `<div class="Bullet1">` converted to list items
- ✅ All image placeholders converted to `![alt](src)`
- ✅ All Note/Warning tables converted to `<Note>`/`<Warning>` components
- ✅ Only one H1 per file
- ✅ Clean Markdown tables without HTML spans
- ✅ Frontmatter present in every file

## 2025-11-20 Update Summary (Gold-Standard MDX)

- **Scope**: `bulk-convert-html-to-mdx-fast.ps1`, `convert-html-to-mdx-enterprise.bat`
- **Goal**: Produce clean, production-ready MDX matching the provided Business Service Map example.

### Key Converter Changes
- **Frontmatter schema (uniform)**: Always emits `title`, `description`, `version`, `module`, `section`, `page`; `breadcrumbs` when available.
- **Version parameterization**: New `-Version` param (default `6.1`), used in frontmatter and filename suffix (`_6_1`, `_6_2`, ...).
- **Remove inline styles**: Generic `style="…"` attributes are stripped (no JSX style objects are emitted).
- **Bold spans**:
  - `<span class="Strong">X</span>` → `**X**`; standalone strong lines promoted to `##`.
  - `<span style="font-weight:bold">X</span>` → `**X**`.
- **Comments**: Removes all HTML comments (`<!-- … -->`), not just empty ones.
- **Ellipsis placeholders**: Lines that are only `...` or `…` are removed.
- **Heading normalization**: One `#` per file; subsequent H1 → H2; standalone bold headings promoted to H2.
- **Tables**: Strips MadCap/data-* attrs, removes spans inside cells, fixes header/alignment rows.
- **Images**: Placeholder spans → Markdown images with filename-derived alt; width preserved when present; paths normalized.
- **Links**: `.htm` → `.mdx` with anchor preserved via LinkMap; slashes normalized.
- **Strict quality behavior**: `-StrictQuality` is now truly strict (no fallback-accept); non-strict still warns without failing.
- **Regex fix**: Corrected quoting in patterns for `data-cellspacing`/`data-cellpadding` cleanup.
- **Failed files summary**: End-of-run prints and logs up to 50 failed file paths.

### Batch Wrapper Updates
- Optional args for `Source` and `Output` (defaults remain `C:\Docs\html\Content` and `C:\Docs\MDX`).
- Continues to run with `-IfExists Overwrite -StrictQuality -EnableCheckpoint -BatchSize 200 -MaxRetries 4`.
- Pandoc pre-check with default path fallback.

### Golden-Output Rules (Implemented)
1. **Frontmatter**: Complete schema as above; breadcrumbs when available; version from parameter.
2. **Headings**: Single H1; demote extra H1s; promote standalone bold to H2.
3. **Spans**: Strong/class or bold style → Markdown bold/headings.
4. **Images**: Placeholder spans converted to Markdown images; alt from filename; width kept; normalized URLs.
5. **Tables**: Clean attributes; remove spans in cells; ensure header + alignment rows; Markdown-only content.
6. **Lists**: `Bullet1`/`emdash1` → list items; normalize UL/OL.
7. **Links**: `.htm` to `.mdx` with anchors; no absolute Windows paths; slashes normalized.
8. **Cleanup**: Remove all HTML comments; remove `style="…"`; strip BOM; collapse multiple blank lines; remove ellipsis-only lines.
9. **Quality gates** (strict): No MadCap remnants, placeholders, `.htm` links, absolute Windows paths in images, or significant HTML remnants.

### Usage
```bat
"C:\Docs\Scripts\mdx\convert-html-to-mdx-enterprise.bat"
```
Optionally override paths:
```bat
"C:\Docs\Scripts\mdx\convert-html-to-mdx-enterprise.bat" "C:\Docs\html\Content" "C:\Docs\MDX"
```
Pass-through flags are supported by editing the batch or invoking the PowerShell script directly with `-Version`, `-MaxThreads`, etc.

### Troubleshooting
- Ensure Pandoc is installed (the batch checks PATH and `C:\Program Files\Pandoc\pandoc.exe`).
- If files fail in strict mode, re-run without `-StrictQuality` to identify warnings, or inspect the log file printed at the end of the run.
- End-of-run includes a compact list of failed files; full details are in the timestamped log under the output folder.

### Notes on Earlier Sections
- The prior checklist section “HTML to JSX Conversion” described converting `style="…"` to JSX. As of 2025‑11‑20, inline styles are **removed entirely** to keep MDX clean. The `class` → `className` conversion remains.

