// Simple Title Navigation Script
(function () {
    let currentIndex = 0;
    let titles = [];
    let isScrolling = false;

    // Initialize titles
    function initTitles() {
        titles = [];

        // Get all h1, h2, h3 headings in order
        const allHeadings = document.querySelectorAll('h1, h2, h3');

        allHeadings.forEach(heading => {
            // Only include visible headings with content
            if (heading.offsetHeight > 0 && heading.textContent.trim()) {
                titles.push(heading);
            }
        });

        console.log('Found titles:', titles.length, titles.map(t => `${t.tagName}: ${t.textContent.trim()}`));
    }

    // Scroll to title
    function scrollToTitle(index) {
        if (index < 0 || index >= titles.length || isScrolling) return;

        isScrolling = true;
        currentIndex = index;

        const target = titles[index];
        const offset = 100;
        const targetY = target.offsetTop - offset;

        console.log(`Scrolling to: "${target.textContent.trim()}" at position ${targetY}`);

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

        const scrollY = window.scrollY + 150;

        // Find the closest title above current scroll position
        for (let i = titles.length - 1; i >= 0; i--) {
            if (titles[i].offsetTop <= scrollY) {
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

    // Keyboard navigation
    function handleKeydown(e) {
        if (titles.length === 0) return;

        let newIndex = currentIndex;
        let shouldScroll = false;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < titles.length - 1) {
                    newIndex = currentIndex + 1;
                    shouldScroll = true;
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    newIndex = currentIndex - 1;
                    shouldScroll = true;
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