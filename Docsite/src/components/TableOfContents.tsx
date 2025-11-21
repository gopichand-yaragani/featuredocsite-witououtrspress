import { useState, useEffect, useRef } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items?: TOCItem[]; // Optional: fallback items if auto-detection fails
  contentSelector?: string; // CSS selector for the content area to scan
}

export function TableOfContents({ items: providedItems, contentSelector = 'article, .prose, article.prose' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [items, setItems] = useState<TOCItem[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * AUTO-DETECTION LOGIC FOR ALL MODULES AND VERSIONS
   * 
   * This component automatically detects H2/H3 headings from content across:
   * - All modules (My Dashboard, CMDB, Discovery Scan, ITSM, ITAM, Admin, etc.)
   * - All versions (NextGen, 6.1.1, 6.1, 5.13)
   * - All content types (MDX files, hardcoded content, future content)
   * 
   * How it works:
   * 1. Scans content area using contentSelector (article, .prose, article.prose)
   * 2. Detects H2 and H3 headings (industry standard - H4+ excluded)
   * 3. Auto-generates IDs if missing
   * 4. Updates automatically when content changes (MutationObserver)
   * 5. Works even when topics are missing (returns null if no headings found)
   * 6. Automatically applies when topics become available
   * 
   * This ensures consistent TOC behavior across the entire documentation site.
   */
  useEffect(() => {
    // Function to detect headings (H2 and H3 only - industry standard)
    const detectHeadings = () => {
      const contentArea = document.querySelector(contentSelector);
      if (!contentArea) {
        // If no content area found and we have fallback items, use them
        if (providedItems && providedItems.length > 0) {
          setItems(providedItems);
        }
        return;
      }

      // Only detect H2 and H3 headings (industry standard - H4+ are too granular)
      const headings = contentArea.querySelectorAll('h2, h3');
      const detectedItems: TOCItem[] = [];

      headings.forEach((heading) => {
        const text = heading.textContent || '';
        if (!text.trim()) return;

        let id = heading.id;
        if (!id) {
          id = generateIdFromText(text);
          heading.id = id;
        }

        // Add scroll margin for smooth scrolling with fixed header
        if (!heading.classList.contains('scroll-mt-20')) {
          heading.classList.add('scroll-mt-20');
        }

        const level = parseInt(heading.tagName.charAt(1));
        
        // Only include H2 and H3 (filter out any H4+ that might slip through)
        if (level === 2 || level === 3) {
          detectedItems.push({
            id,
            text: text.trim(),
            level,
          });
        }
      });

      // Update items if we found headings, otherwise use fallback
      if (detectedItems.length > 0) {
        setItems(detectedItems);
      } else if (providedItems && providedItems.length > 0) {
        // Only use provided items if auto-detection found nothing
        setItems(providedItems);
      }
    };

    // Initial detection
    detectHeadings();

    // Use MutationObserver to detect when content changes (for async-loaded content)
    const observer = new MutationObserver(() => {
      detectHeadings();
    });

    // Observe the content area for changes
    const contentArea = document.querySelector(contentSelector);
    if (contentArea) {
      observer.observe(contentArea, {
        childList: true,
        subtree: true,
      });
    }

    // Also check after a short delay for async-loaded content (fallback)
    const timeoutId = setTimeout(() => {
      detectHeadings();
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [contentSelector, providedItems]);

  // Set up Intersection Observer for scroll-spy (active section tracking)
  useEffect(() => {
    if (items.length === 0) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with improved rootMargin for better scroll-spy detection
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry that's closest to the top of the viewport (within the rootMargin)
        let closestEntry: IntersectionObserverEntry | null = null;
        let closestDistance = Infinity;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            // Calculate distance from top of viewport (accounting for header offset)
            const distance = Math.abs(rect.top - 100); // 100px offset for header
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestEntry = entry;
            }
          }
        });

        // If no intersecting entry, find the one that just passed the top
        if (!closestEntry) {
          entries.forEach((entry) => {
            const rect = entry.boundingClientRect;
            // If heading is above viewport but close, it's the active one
            if (rect.top < 100 && rect.bottom > 0) {
              closestEntry = entry;
            }
          });
        }

        if (closestEntry) {
          setActiveId(closestEntry.target.id);
        }
      },
      {
        // rootMargin: top offset for header, bottom threshold for next section
        rootMargin: '-100px 0px -66% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all heading elements
    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [items]);

  // Handle URL hash changes (when user navigates via URL or browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveId(hash);
          }, 100);
        }
      }
    };

    // Check initial hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Helper function to generate ID from text
  function generateIdFromText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Handle smooth scroll navigation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // Update URL hash without triggering scroll
      window.history.pushState(null, '', `#${id}`);
      
      // Smooth scroll to element with offset for fixed header
      const top = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      
      // Update active state
      setActiveId(id);
      
      // Focus the heading for accessibility
      element.focus();
    }
  };

  if (items.length === 0) return null;

  // Group items by H2 sections for better visual organization
  const groupedItems: { h2: TOCItem; h3s: TOCItem[] }[] = [];
  let currentH2: TOCItem | null = null;
  let currentH3s: TOCItem[] = [];

  items.forEach((item) => {
    if (item.level === 2) {
      // Save previous H2 group if exists
      if (currentH2) {
        groupedItems.push({ h2: currentH2, h3s: currentH3s });
      }
      // Start new H2 group
      currentH2 = item;
      currentH3s = [];
    } else if (item.level === 3 && currentH2) {
      // Add H3 to current H2 group
      currentH3s.push(item);
    }
  });

  // Don't forget the last group
  if (currentH2) {
    groupedItems.push({ h2: currentH2, h3s: currentH3s });
  }

  // If no grouping worked (all H3s or mixed), just show flat list
  const useGrouped = groupedItems.length > 0 && items.some(item => item.level === 2);

  return (
    <div className="sticky top-20 hidden xl:block max-h-[calc(100vh-5rem)] overflow-y-auto" role="complementary" aria-label="Table of contents">
      <div className="pb-4 mb-4 border-b border-slate-200">
        <h4 className="text-sm text-black-premium font-semibold">On this page</h4>
      </div>
      <nav 
        className="space-y-1" 
        aria-label="Page sections"
        role="navigation"
      >
        {useGrouped ? (
          // Render grouped structure (H2 with nested H3s)
          groupedItems.map((group) => {
            const isH2Active = activeId === group.h2.id;
            const hasActiveH3 = group.h3s.some(h3 => activeId === h3.id);
            
            return (
              <div key={group.h2.id} className="space-y-1">
                <a
                  href={`#${group.h2.id}`}
                  className={`block text-sm py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded pl-0 ${
                    isH2Active || hasActiveH3
                      ? 'text-emerald-600 font-medium'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={(e) => handleNavClick(e, group.h2.id)}
                  aria-current={isH2Active ? 'location' : undefined}
                  aria-label={`Navigate to ${group.h2.text} section`}
                >
                  {group.h2.text}
                </a>
                {group.h3s.length > 0 && (
                  <div className="pl-4 space-y-0.5">
                    {group.h3s.map((h3) => {
                      const isH3Active = activeId === h3.id;
                      return (
                        <a
                          key={h3.id}
                          href={`#${h3.id}`}
                          className={`block text-sm py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded ${
                            isH3Active
                              ? 'text-emerald-600 font-medium'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                          onClick={(e) => handleNavClick(e, h3.id)}
                          aria-current={isH3Active ? 'location' : undefined}
                          aria-label={`Navigate to ${h3.text} section`}
                        >
                          {h3.text}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Render flat list (fallback for pages without H2 structure)
          items.map((item) => {
            const isActive = activeId === item.id;
            const indentClass = item.level === 2 ? 'pl-0' : item.level === 3 ? 'pl-4' : 'pl-8';
            
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block text-sm py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded ${indentClass} ${
                  isActive
                    ? 'text-emerald-600 font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={(e) => handleNavClick(e, item.id)}
                aria-current={isActive ? 'location' : undefined}
                aria-label={`Navigate to ${item.text} section`}
              >
                {item.text}
              </a>
            );
          })
        )}
      </nav>
    </div>
  );
}
