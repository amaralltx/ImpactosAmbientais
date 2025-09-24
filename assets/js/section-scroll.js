// Simple Title Navigation Script
(function () {
    let currentIndex = 0;
    let titles = [];
    let isScrolling = false;

    // Initialize titles - all navigable elements
    function initTitles() {
        titles = [];

        // Get all sections and headings in document order
        const allElements = document.querySelectorAll('section[id], h1, h2, h3');

        allElements.forEach(element => {
            // Only include visible elements with content
            if (element.offsetHeight > 0) {
                // For sections, use the section element or its main heading
                if (element.tagName === 'SECTION') {
                    const heading = element.querySelector('h1, h2') || element;
                    titles.push(heading);
                }
                // For headings, include if they have meaningful content
                else if (element.textContent.trim()) {
                    titles.push(element);
                }
            }
        });

        // Remove duplicates and sort by position
        titles = titles.filter((element, index, arr) => {
            return arr.findIndex(el => el.offsetTop === element.offsetTop) === index;
        }).sort((a, b) => a.offsetTop - b.offsetTop);

        console.log('Found navigable elements:', titles.length, titles.map(t => `${t.tagName}: ${t.textContent?.trim() || t.id}`));
    }

    // Check if element is significantly visible in viewport
    function isElementSignificantlyVisible(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Element is significantly visible if it's well within viewport
        // (not just peeking at edges)
        const elementHeight = rect.bottom - rect.top;
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);

        return rect.top >= -50 && rect.top < viewportHeight * 0.7 &&
            visibleHeight > elementHeight * 0.3; // At least 30% visible
    }

    // Check if two elements are close enough to be considered "side by side"
    function areElementsClose(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Elements are close if they would appear on screen together
        const distance = Math.abs(rect2.top - rect1.top);
        return distance < viewportHeight * 0.8; // Less than 80% of viewport height apart
    }

    // Scroll to title
    function scrollToTitle(index) {
        if (index < 0 || index >= titles.length || isScrolling) return;

        isScrolling = true;
        currentIndex = index;

        const target = titles[index];
        const offset = 100; // Good offset for visibility
        const targetY = target.offsetTop - offset;

        const targetText = target.textContent?.trim() || target.id || 'Section';
        console.log(`Scrolling to: "${targetText}" at position ${targetY}`);

        window.scrollTo({
            top: Math.max(0, targetY),
            behavior: 'smooth'
        });

        setTimeout(() => {
            isScrolling = false;
        }, 800);
    }

    // Get current title index based on scroll position
    function getCurrentIndex() {
        if (titles.length === 0) return 0;

        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const viewportCenter = scrollY + (viewportHeight / 2);

        // Find the section that's currently most visible in viewport
        for (let i = titles.length - 1; i >= 0; i--) {
            const element = titles[i];
            const elementTop = element.offsetTop;

            // Check if this section is above or at the center of viewport
            if (elementTop <= viewportCenter) {
                return i;
            }
        }
        return 0;
    }

    // Update current index when scrolling manually
    function updateCurrentIndex() {
        if (!isScrolling) {
            currentIndex = getCurrentIndex();
            console.log('Current index updated to:', currentIndex, titles[currentIndex]?.textContent.trim());
        }
    }

    // Keyboard navigation with intelligent section detection
    function handleKeydown(e) {
        if (titles.length === 0) return;

        let newIndex = currentIndex;
        let shouldScroll = false;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                // Find next section that's not close to current one
                for (let i = currentIndex + 1; i < titles.length; i++) {
                    const currentElement = titles[currentIndex];
                    const nextElement = titles[i];

                    // Skip if elements are too close (side by side)
                    if (!areElementsClose(currentElement, nextElement) ||
                        !isElementSignificantlyVisible(nextElement)) {
                        newIndex = i;
                        shouldScroll = true;
                        break;
                    }
                    // If we're at the last few elements, just go to next
                    else if (i === titles.length - 1 || i > currentIndex + 2) {
                        newIndex = i;
                        shouldScroll = true;
                        break;
                    }
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                // Find previous section that's not close to current one
                for (let i = currentIndex - 1; i >= 0; i--) {
                    const currentElement = titles[currentIndex];
                    const prevElement = titles[i];

                    // Skip if elements are too close (side by side)
                    if (!areElementsClose(currentElement, prevElement) ||
                        !isElementSignificantlyVisible(prevElement)) {
                        newIndex = i;
                        shouldScroll = true;
                        break;
                    }
                    // If we're at the first few elements, just go to previous
                    else if (i === 0 || i < currentIndex - 2) {
                        newIndex = i;
                        shouldScroll = true;
                        break;
                    }
                }
                break;

            case 'Home':
                e.preventDefault();
                newIndex = 0;
                shouldScroll = true;
                break;

            case 'End':
                e.preventDefault();
                newIndex = titles.length - 1;
                shouldScroll = true;
                break;
        }

        if (shouldScroll && !isScrolling) {
            currentIndex = newIndex;
            scrollToTitle(currentIndex);
        }
    }

    // Initialize
    function init() {
        initTitles();

        if (titles.length > 0) {
            // Add keyboard listener
            document.addEventListener('keydown', handleKeydown);

            // Add scroll listener to update current index
            window.addEventListener('scroll', updateCurrentIndex);

            // Set initial index
            currentIndex = getCurrentIndex();

            console.log('Title navigation initialized with', titles.length, 'titles');
            console.log('Current index:', currentIndex);

            // Debug: show all titles
            titles.forEach((title, i) => {
                console.log(`${i}: ${title.tagName} - "${title.textContent.trim()}" at ${title.offsetTop}px`);
            });
        } else {
            console.log('No titles found for navigation');
        }
    }

    // Start when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();