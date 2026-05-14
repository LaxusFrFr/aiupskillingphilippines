// Bine-style smooth scroll implementation for benefits.html
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
    const heroSections = document.querySelectorAll('.hero-benefits');
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

// Background orbs animation for sections
function initBackgroundOrbsAnimation() {
    if (typeof gsap === 'undefined') return;

    // Expected Results orbs
    const expectedResultsOrbs = document.querySelectorAll('.expected-results-bg-orb');
    expectedResultsOrbs.forEach((orb, index) => {
        gsap.to(orb, {
            x: index === 0 ? 100 : -80,
            y: index === 0 ? 60 : -50,
            scale: 1.2,
            opacity: 0.6,
            duration: 8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: index * 0.3
        });
    });

    // Multi-Level Impact orbs
    const impactOrbs = document.querySelectorAll('.multi-level-impact-bg-orb');
    impactOrbs.forEach((orb, index) => {
        gsap.to(orb, {
            x: index === 0 ? 90 : -70,
            y: index === 0 ? 50 : -40,
            scale: 1.3,
            opacity: 0.5,
            duration: 9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: index * 0.4
        });
    });

    // Career Pathways orbs
    const careerOrbs = document.querySelectorAll('.career-pathways-bg-orb');
    careerOrbs.forEach((orb, index) => {
        gsap.to(orb, {
            x: index === 0 ? 85 : -65,
            y: index === 0 ? 45 : -35,
            scale: 1.25,
            opacity: 0.55,
            duration: 7,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: index * 0.35
        });
    });

    // Project Outlook orbs
    const outlookOrbs = document.querySelectorAll('.project-outlook-bg-orb');
    outlookOrbs.forEach((orb, index) => {
        gsap.to(orb, {
            x: index === 0 ? 95 : -75,
            y: index === 0 ? 55 : -45,
            scale: 1.2,
            opacity: 0.6,
            duration: 8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: index * 0.3
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
                
                // Reveal elements with staggered delays
                revealElements.forEach((el) => {
                    let delay = 0;
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

    // Observe all sections including hero and benefits sections
    const sections = document.querySelectorAll('.hero, .expected-results-section, .multi-level-impact-section, .career-pathways-section, .me-framework-section, .project-outlook-section, .cta-section-how-it-works, .site-footer');
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

// Falling shapes for CTA section - same as index.html
function initCtaFallingShapes() {
    const ctaCard = document.querySelector('.cta-section .cta-card');
    if (!ctaCard) return;
    const container = ctaCard.querySelector('.cta-falling-shapes');
    if (!container) return;
    if (typeof gsap === 'undefined') return;

    const shapes = container.querySelectorAll('.falling-shape, .falling-text');
    if (!shapes.length) return;

    const place = (shape, isInitial) => {
        const w = container.offsetWidth || 1200;
        const h = container.offsetHeight || 400;

        // For initial placement, spawn shapes already mid-flight across the
        // full width so the user sees them immediately. After that, shapes
        // always start off-screen left and stream rightward.
        const startX = isInitial
            ? -150 + Math.random() * (w + 150)
            : -150 - Math.random() * 200;
        const startY = Math.random() * h;

        // End well past right edge, with mild vertical drift
        const endX = w + 150 + Math.random() * 150;
        const endY = startY + (Math.random() * 100 - 50);

        // Speed: full traversal time
        const fullDuration = 10 + Math.random() * 8;
        // Adjust duration so the remaining distance feels consistent
        const remaining = (endX - startX) / (w + 300);
        const duration = Math.max(3, fullDuration * remaining);

        const delay = isInitial ? Math.random() * 1.5 : 0;

        gsap.killTweensOf(shape);
        gsap.set(shape, {
            x: startX,
            y: startY,
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.5,
            opacity: 0.45 + Math.random() * 0.4,
            force3D: true
        });

        gsap.to(shape, {
            x: endX,
            y: endY,
            rotation: `+=${180 + Math.random() * 360}`,
            duration: duration,
            delay: delay,
            ease: 'none',
            onComplete: () => place(shape, false)
        });

        // Subtle opacity pulse
        gsap.to(shape, {
            opacity: 0.3 + Math.random() * 0.4,
            duration: 2 + Math.random() * 2,
            delay: delay,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    };

    shapes.forEach((s) => place(s, true));

    // Pause when off-screen
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                shapes.forEach((s) => {
                    const tweens = gsap.getTweensOf(s);
                    tweens.forEach((t) => entry.isIntersecting ? t.play() : t.pause());
                });
            });
        }, { threshold: 0.05 });
        io.observe(ctaCard);
    }

    // Reposition on resize
    let resizeRaf = 0;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            shapes.forEach((s) => place(s, true));
        });
    });
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

// Career Pathways Timeline animation
function initCareerPathwaysTimeline() {
    const timeline = document.getElementById('careerPathwaysTimeline');
    if (!timeline) return;
    const items = Array.from(timeline.querySelectorAll('.pathway-item-timeline'));
    let ticking = false;

    const RAMP = 150; // Increased ramp for smoother glow transitions

    const update = () => {
        ticking = false;
        const rect = timeline.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;

        // Use a larger scroll window for smoother progress
        const start = vh * 0.85;
        const end = vh * 0.15;
        const span = rect.height + (start - end);
        const traveled = start - rect.top;

        // Smooth progress calculation with easing
        let progress = traveled / span;
        progress = Math.max(0, Math.min(1, progress));

        // Apply smooth easing to progress itself
        progress = progress * progress * (3 - 2 * progress);

        timeline.style.setProperty('--timeline-progress', progress.toFixed(4));

        const top = rect.top + 60;
        const bottom = rect.bottom - 60;
        const fillBottom = top + (bottom - top) * progress;

        items.forEach((item) => {
            const icon = item.querySelector('.pathway-step-icon');
            if (!icon) return;
            const iconRect = icon.getBoundingClientRect();
            const iconCenter = iconRect.top + iconRect.height / 2;

            // Continuous 0..1: starts ramping RAMP px before the bar reaches the icon,
            // hits 1 when the bar passes the icon center.
            const dist = fillBottom - iconCenter;
            let glow = (dist + RAMP) / RAMP;
            glow = Math.max(0, Math.min(1, glow));

            // Smoother easing function
            glow = glow * glow * (3 - 2 * glow);

            item.style.setProperty('--iglow', glow.toFixed(4));
        });
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    };

    // Use Lenis scroll event if available for smoother interpolation
    if (bineLenis) {
        bineLenis.on('scroll', update);
    } else {
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Initial update with slight delay to ensure layout is ready
    setTimeout(update, 100);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSafeScrollReveal();
    initNavbarScroll();
    initNavbarBrandHandler();
    initSmoothAutoHide();
    initHeroParallax();
    initHeroLightOrbsAnimation();
    initBackgroundOrbsAnimation();
    initCtaFallingShapes();
    initMobileMenu();
    initAnchorLinks();
    initCareerPathwaysTimeline();
});
