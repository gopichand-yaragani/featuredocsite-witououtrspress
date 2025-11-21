import os
import re
from pathlib import Path

# Paths
base_path = Path(r"C:\Users\GopichandY\github\FeatureDocsite\src\content\6_1")
index_file = base_path / "index.mdx"

def normalize_path(path_str):
    """Normalize path for comparison"""
    return path_str.lower().replace('\\', '/').replace('-', '_').strip('/')

def find_file_by_name(target_name, root_dir):
    """Find a file by matching its name (case-insensitive, ignoring hyphens/underscores)"""
    target_normalized = normalize_path(target_name)
    
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.mdx'):
                file_normalized = normalize_path(file.replace('.mdx', ''))
                if target_normalized == file_normalized:
                    rel_path = os.path.relpath(os.path.join(root, file), root_dir)
                    return rel_path.replace('\\', '/')
    return None

def get_all_files(root_dir):
    """Get all MDX files with their relative paths"""
    files = {}
    for root, dirs, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith('.mdx'):
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, root_dir)
                normalized = normalize_path(rel_path.replace('.mdx', ''))
                files[normalized] = rel_path.replace('\\', '/')
    return files

def extract_links(content):
    """Extract all markdown links from content"""
    pattern = r'\[([^\]]+)\]\(([^)]+)\)'
    matches = re.findall(pattern, content)
    return matches

def fix_path_in_toc(toc_path, all_files):
    """Try to find the correct path for a broken TOC link"""
    # Remove /6_1/ prefix if present
    clean_path = toc_path.replace('/6_1/', '').strip('/')
    
    # Try direct match
    normalized = normalize_path(clean_path)
    if normalized in all_files:
        return '/6_1/' + all_files[normalized].replace('.mdx', '')
    
    # Try matching just the filename
    filename = os.path.basename(clean_path)
    filename_normalized = normalize_path(filename)
    
    for normalized_path, actual_path in all_files.items():
        if normalized_path.endswith(filename_normalized) or filename_normalized in normalized_path:
            return '/6_1/' + actual_path.replace('.mdx', '')
    
    # Try partial matching
    parts = clean_path.split('/')
    if len(parts) > 0:
        last_part = normalize_path(parts[-1])
        for normalized_path, actual_path in all_files.items():
            if normalized_path.endswith(last_part):
                return '/6_1/' + actual_path.replace('.mdx', '')
    
    return None

# Read index.mdx
with open(index_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Get all files
print("Scanning all MDX files...")
all_files = get_all_files(base_path)
print(f"Found {len(all_files)} MDX files")

# Extract links
links = extract_links(content)
print(f"Found {len(links)} links in TOC")

# Check each link
broken_links = []
fixes = {}

for text, url in links:
    if not url.startswith('/6_1/'):
        continue
    
    # Convert URL to file path
    file_path = url.replace('/6_1/', '')
    expected_file = base_path / (file_path + '.mdx')
    
    # Normalize for comparison
    file_normalized = normalize_path(file_path)
    
    # Check if file exists
    if not expected_file.exists():
        # Try to find the correct path
        correct_path = fix_path_in_toc(url, all_files)
        if correct_path:
            broken_links.append((text, url, correct_path))
            fixes[url] = correct_path
            print(f"BROKEN: {url}")
            print(f"  FOUND: {correct_path}")
        else:
            print(f"BROKEN (NO FIX FOUND): {url} - {text}")

print(f"\nFound {len(broken_links)} broken links with potential fixes")
print(f"\nFixes to apply:")
for old, new in fixes.items():
    print(f"  {old} -> {new}")

# Write fixes to a file
with open(base_path.parent.parent / 'toc_fixes.txt', 'w', encoding='utf-8') as f:
    f.write("TOC Link Fixes\n")
    f.write("=" * 80 + "\n\n")
    for old, new in fixes.items():
        f.write(f"OLD: {old}\n")
        f.write(f"NEW: {new}\n")
        f.write("-" * 80 + "\n")

print(f"\nFixes written to toc_fixes.txt")

