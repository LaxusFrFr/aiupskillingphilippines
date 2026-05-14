// Bine-style smooth scroll implementation for team.html
// No ScrollTrigger - only Lenis + simple RAF throttling

/**
 * Lenis smooth scroll - same configuration as Bine
 */
let bineLenis = null;
const HOME_HASH_SCROLL_OFFSET = -80;

const LenisCtor = typeof Lenis !== "undefined" ? Lenis : window.Lenis || globalThis.Lenis;
if (LenisCtor) {
    document.documentElement.style.scrollBehavior = "auto";
    bineLenis = new LenisCtor({
        autoRaf: true,
        smoothWheel: true,
        wheelMultiplier: 1.15,
        touchMultiplier: 1.15,
        lerp: 0.085,
    });
}

/** Call after body/html overflow scroll-lock is cleared so Lenis resyncs */
function refreshLenisAfterScrollLock() {
    if (!bineLenis) return;
    requestAnimationFrame(() => {
        bineLenis.resize();
    });
}

if (bineLenis) {
    let lenisResizeRaf = 0;
    window.addEventListener(
        "resize",
        () => {
            cancelAnimationFrame(lenisResizeRaf);
            lenisResizeRaf = requestAnimationFrame(() => bineLenis.resize());
        },
        { passive: true }
    );
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") refreshLenisAfterScrollLock();
    });
}

function scrollToHashAnchor(href, event) {
    if (!href || !href.startsWith("#")) return false;
    const id = href.slice(1);
    if (!id) return false;
    const target = document.getElementById(id);
    if (!target) return false;
    if (event) event.preventDefault();
    if (bineLenis) {
        bineLenis.scrollTo(target, { offset: HOME_HASH_SCROLL_OFFSET });
    } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return true;
}

// Navbar background toggle - Bine approach with RAF throttling
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let ticking = false;
    
    const updateNavbar = () => {
        ticking = false;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add navbar-scrolled class when scrolled past 80px
        if (scrollTop > 80) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    };
    
    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateNavbar);
        }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial call
    updateNavbar();
}

// Smooth auto-hide navbar - Bine approach
function initSmoothAutoHide() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollTop = 0;
    let ticking = false;
    const scrollThreshold = 5;
    
    const updateHeaderVisibility = () => {
        ticking = false;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = Math.abs(scrollTop - lastScrollTop);
        
        // Only trigger if scroll amount exceeds threshold (prevents jitter)
        if (scrollDelta < scrollThreshold) {
            lastScrollTop = scrollTop;
            return;
        }
        
        if (scrollTop > 100) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down - hide navbar
                navbar.classList.add('navbar-hidden');
            } else {
                // Scrolling up - show navbar
                navbar.classList.remove('navbar-hidden');
            }
        } else {
            // At top - always show
            navbar.classList.remove('navbar-hidden');
        }
        
        lastScrollTop = scrollTop;
    };
    
    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(updateHeaderVisibility);
        }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial call
    updateHeaderVisibility();
}

// Hero parallax - Bine approach with RAF throttling
function initHeroParallax() {
    const hero = document.querySelector(".hero-section--parallax");
    const bg = hero?.querySelector(".hero-bg");
    if (!hero || !bg) return;

    let ticking = false;
    let currentTranslateY = 0;

    const applyParallax = () => {
        ticking = false;

        // Get scroll position
        const scrolled = window.pageYOffset;
        const heroTop = hero.offsetTop;
        const heroHeight = hero.offsetHeight;

        // Calculate how much the user has scrolled past the hero
        const scrollProgress = scrolled / (heroTop + heroHeight);

        // Apply parallax: move background up slower than scroll
        currentTranslateY = scrolled * 0.5;

        // Apply the transform
        bg.style.transform = `translate3d(0, ${currentTranslateY}px, 0)`;
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(applyParallax);
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial call
    applyParallax();
}

// Hero light orbs animation - GSAP only (no ScrollTrigger needed)
function initHeroLightOrbsAnimation() {
    const heroSections = document.querySelectorAll('.hero-team');
    if (!heroSections.length) return;

    if (typeof gsap === 'undefined') return;

    heroSections.forEach((hero) => {
        const orb1 = hero.querySelector('.hero-light-orb-1');
        const orb2 = hero.querySelector('.hero-light-orb-2');
        if (!orb1 || !orb2) return;

        gsap.to(orb1, {
            x: 80,
            y: 40,
            scale: 1.3,
            opacity: 0.8,
            duration: 6,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });

        gsap.to(orb2, {
            x: -60,
            y: -40,
            scale: 1.4,
            opacity: 0.7,
            duration: 7,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 0.5
        });
    });
}

// Safe scroll reveal animations - Section-based observation (Bine approach)
function initSafeScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                
                // Find all scroll-reveal elements within this section
                const revealElements = section.querySelectorAll('.scroll-reveal-safe, .scroll-reveal-scale, .scroll-reveal-left, .scroll-reveal-right');
                
                // Add extra delay for Academic Context section
                const isAcademicContext = section.querySelector('.academic-context-card');
                const baseDelay = isAcademicContext ? 500 : 0;
                
                // Reveal elements with staggered delays
                revealElements.forEach((el) => {
                    let delay = baseDelay;
                    if (el.classList.contains('stagger-1')) delay += 50;
                    else if (el.classList.contains('stagger-2')) delay += 100;
                    else if (el.classList.contains('stagger-3')) delay += 150;
                    else if (el.classList.contains('stagger-4')) delay += 200;
                    else if (el.classList.contains('stagger-5')) delay += 250;
                    else if (el.classList.contains('stagger-6')) delay += 300;
                    else if (el.classList.contains('stagger-7')) delay += 350;
                    else if (el.classList.contains('stagger-8')) delay += 400;
                    
                    setTimeout(() => {
                        el.classList.add('is-visible');
                    }, delay);
                });
                
                observer.unobserve(section);
            }
        });
    }, observerOptions);

    // Observe all sections including hero
    const sections = document.querySelectorAll('.hero, section.py-5, .site-footer');
    sections.forEach(section => observer.observe(section));

    // Reveal hero section immediately on load
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const heroElements = heroSection.querySelectorAll('.scroll-reveal-safe, .scroll-reveal-scale, .scroll-reveal-left, .scroll-reveal-right');
        heroElements.forEach((el) => {
            let delay = 0;
            if (el.classList.contains('stagger-1')) delay = 50;
            else if (el.classList.contains('stagger-2')) delay = 100;
            
            setTimeout(() => {
                el.classList.add('is-visible');
            }, delay);
        });
    }

    // Add scroll-reveal classes to footer elements
    const footer = document.querySelector('.site-footer');
    if (footer) {
        const footerElements = footer.querySelectorAll('.site-footer-title, .site-footer-desc, .site-footer-links li, .site-footer-contact li, .site-footer-social-link, .site-footer-bottom p');
        footerElements.forEach((el, index) => {
            el.classList.add('scroll-reveal-safe');
            el.classList.add(`stagger-${Math.min(index + 1, 8)}`);
        });
    }

    // Safety fallback: Force visibility after 3 seconds
    setTimeout(() => {
        document.querySelectorAll('.scroll-reveal-safe, .scroll-reveal-scale, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
            if (!el.classList.contains('is-visible')) {
                el.classList.add('is-visible');
            }
        });
    }, 3000);
}

// Mobile menu handling with Lenis scroll lock
function initMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        const restoreBodyScroll = () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            if (bineLenis) {
                bineLenis.start();
                refreshLenisAfterScrollLock();
            }
        };

        navbarToggler.addEventListener('click', () => {
            const isOpen = navbarCollapse.classList.contains('show');
            
            if (!isOpen) {
                // Opening menu - stop Lenis and lock scroll
                if (bineLenis) bineLenis.stop();
                document.body.style.overflow = "hidden";
                document.documentElement.style.overflow = "hidden";
            } else {
                // Closing menu - restore Lenis and scroll
                restoreBodyScroll();
            }
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                navbarCollapse.classList.remove('show');
                restoreBodyScroll();
                
                // Skip loading screen when clicking Home nav link
                if (link.getAttribute('href') === 'index.html') {
                    e.preventDefault();
                    window.location.href = 'index.html?noload=true';
                }
            });
        });
    }
}

// Handle navbar-brand (logo) click - show loading screen
function initNavbarBrandHandler() {
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand && navbarBrand.getAttribute('href') === 'index.html') {
        navbarBrand.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
}

// Smooth scroll for anchor links
function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            scrollToHashAnchor(anchor.getAttribute('href') || "", e);
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSafeScrollReveal();
    initNavbarScroll();
    initSmoothAutoHide();
    initHeroParallax();
    initHeroLightOrbsAnimation();
    initMobileMenu();
    initNavbarBrandHandler();
    initAnchorLinks();
});
