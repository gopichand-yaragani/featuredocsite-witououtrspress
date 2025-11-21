import os
import re
from pathlib import Path

# Paths
base_path = Path(r"C:\Users\GopichandY\github\FeatureDocsite\src\content\6_1")
index_file = base_path / "index.mdx"

def normalize_path(path_str):
    """Normalize path for comparison"""
    return path_str.lower().replace('\\', '/').replace('-', '_').strip('/')

# Read index.mdx
with open(index_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all links
pattern = r'\[([^\]]+)\]\(([^)]+)\)'
links = re.findall(pattern, content)

# Filter only /6_1/ links
toc_links = [(text, url) for text, url in links if url.startswith('/6_1/')]

print(f"Total TOC links: {len(toc_links)}")

# Check each link
broken_links = []
valid_links = []

for text, url in toc_links:
    # Convert URL to file path
    file_path = url.replace('/6_1/', '')
    expected_file = base_path / (file_path + '.mdx')
    
    if expected_file.exists():
        valid_links.append((text, url))
    else:
        broken_links.append((text, url))

print(f"Valid links: {len(valid_links)}")
print(f"Broken links: {len(broken_links)}")

if broken_links:
    print("\nBroken links:")
    for text, url in broken_links:
        print(f"  - {text}: {url}")
else:
    print("\nAll links are valid!")

