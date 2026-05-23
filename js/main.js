// ==========================================================================
// PORTFOLIO WEBSITE - MAIN JAVASCRIPT
// ==========================================================================

// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');
const navLinkElements = document.querySelectorAll('.nav-link');

// ==================== Mobile Menu ====================
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when a link is clicked
navLinkElements.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ==================== Navbar Scroll Effect ====================
let lastScrollPosition = 0;

window.addEventListener('scroll', () => {
    const currentScrollPosition = window.pageYOffset;
    
    if (currentScrollPosition > 100) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    }
    
    lastScrollPosition = currentScrollPosition;
});

// ==================== Smooth Scroll for Navigation ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const element = document.querySelector(href);
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== Notification System ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== Add CSS Animation Styles ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @media (max-width: 768px) {
        .notification {
            left: 20px !important;
            right: 20px !important;
            top: auto !important;
            bottom: 20px !important;
        }
    }
`;
document.head.appendChild(style);

// ==================== Lazy Loading Images ====================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ==================== Analytics Tracking ====================
function trackEvent(eventName, eventData) {
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    console.log(`Event: ${eventName}`, eventData);
}

// Track button clicks
document.querySelectorAll('.btn, a').forEach(element => {
    element.addEventListener('click', () => {
        trackEvent('link_click', {
            link_text: element.textContent,
            link_url: element.href
        });
    });
});

// ==================== Print Functionality ====================
function printPage() {
    window.print();
    trackEvent('print', { page: window.location.pathname });
}

// ==================== Scroll to Top Button ====================
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.id = 'scrollToTop';
    button.innerHTML = '↑';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.5rem;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease-out;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        trackEvent('scroll_to_top', {});
    });
}

// Initialize scroll to top button
createScrollToTopButton();

// ==================== Initialize on Load ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio site loaded successfully');
    
    // Add any initialization code here
    initializePageMetrics();
});

// ==================== Page Metrics ====================
function initializePageMetrics() {
    const pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    const pageView = {
        page_title: document.title,
        page_path: window.location.pathname,
        load_time: pageLoadTime
    };
    trackEvent('page_view', pageView);
}

// Export functions for external use if needed
window.portfolioApp = {
    trackEvent,
    showNotification,
    printPage
};
