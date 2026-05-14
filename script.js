// Initialize GSAP and register plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/**
 * Lenis smooth scroll on any page with `<html class="lenis-scroll">`. Self-hosted `js/lenis.min.js`.
 * Browsers often disable CSS `scroll-behavior: smooth` and `scrollIntoView({behavior:'smooth'})`
 * when the user prefers reduced motion—Lenis uses its own interpolation, so it still feels smooth
 * (like many marketing sites) once this script runs. Not gated on prefers-reduced-motion.
 * Tune: wheelMultiplier / lerp (see Lenis docs).
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

/** Call after body/html overflow scroll-lock is cleared so Lenis resyncs (fixes "back to normal" scroll). */
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

// Connect Lenis to GSAP ScrollTrigger
if (bineLenis) {
    bineLenis.on('scroll', ScrollTrigger.update);
}

// Navbar animations
function initNavbarAnimations() {
    // Navbar background on scroll
    ScrollTrigger.create({
        start: "top -80",
        end: 99999,
        toggleClass: {className: "navbar-scrolled", targets: ".navbar"}
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            scrollToHashAnchor(anchor.getAttribute('href') || "", e);
        });
    });
}

// Button and interaction animations
function initInteractionAnimations() {
    // Button hover effects
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            gsap.to(this, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        button.addEventListener('mouseleave', function() {
            gsap.to(this, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });

    // Navbar hover animations with smooth green bar
    document.querySelectorAll('.nav-item').forEach(item => {
        const link = item.querySelector('.nav-link');
        const navBar = item.querySelector('.nav-bar');
        if (!navBar) return;

        // Initial state: hidden, scaled to 0
        gsap.set(navBar, { scaleX: 0, opacity: 0 });

        item.addEventListener('mouseenter', function() {
            // Kill any ongoing tweens to prevent conflicts during rapid mouse movement
            gsap.killTweensOf(navBar);
            gsap.to(navBar, {
                scaleX: 1,
                opacity: 1,
                duration: 0.6,
                ease: "power3.out"
            });
        });

        item.addEventListener('mouseleave', function() {
            // Kill any ongoing tweens
            gsap.killTweensOf(navBar);
            gsap.to(navBar, {
                scaleX: 0,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            });
        });
    });

    // Animate navbar
    gsap.from(".navbar", {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
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
                
                gsap.from(".navbar-nav .nav-link", {
                    y: -20,
                    opacity: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out"
                });
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

// Performance optimizations
function initPerformanceOptimizations() {
    // Detect device capabilities
    const isAndroid = /Android/i.test(navigator.userAgent || "");
    const isIOS = 
        /iPad|iPhone|iPod/i.test(navigator.userAgent || "") ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    
    // Add device classes
    if (isAndroid) {
        document.documentElement.classList.add('android-device');
    }
    if (isIOS) {
        document.documentElement.classList.add('ios-device');
    }
}

// Fallback for when JavaScript is disabled
function initFallbacks() {
    // Add no-js class for CSS fallbacks
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
}


// Smooth auto-hide navbar - CSS class-based with threshold
function initSmoothAutoHide() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollTop = 0;
    let scrollThreshold = 5; // Minimum scroll amount to trigger hide/show
    
    window.addEventListener('scroll', function() {
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
    }, { passive: true });
}

// Simple and effective parallax for hero section
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

        // Apply parallax: move background up slower than scroll (creates parallax effect)
        // When user scrolls down, background moves up at 50% speed
        currentTranslateY = scrolled * 0.5;

        // Apply the transform (combined with GSAP animation)
        gsap.set(bg, {
            y: currentTranslateY
        });
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(applyParallax);
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Subtle background animation using GSAP
    // Slowly pan the background position for a smooth, breathing effect
    gsap.to(bg, {
        backgroundPosition: "110% center",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "none"
    });

    // Professional falling shapes animation - snow/rain effect
    const shapesContainer = hero.querySelector('.hero-falling-shapes');
    if (shapesContainer) {
        const shapes = shapesContainer.querySelectorAll('.falling-shape, .falling-text');
        const totalShapes = shapes.length;
        const containerWidth = shapesContainer.offsetWidth;

        shapes.forEach((shape, index) => {
            // Kill any existing animations to prevent conflicts
            gsap.killTweensOf(shape);
            
            // Random position across full width
            const randomX = Math.random() * containerWidth; // Full width distribution
            const startY = -100 - Math.random() * 200; // Start above viewport
            const duration = 8 + Math.random() * 6; // 8-14 seconds like snow
            const delay = Math.random() * 5; // Random start times
            
            // Initial position at random X, above viewport
            gsap.set(shape, {
                x: randomX,
                y: startY,
                rotation: Math.random() * 360,
                scale: 0.6 + Math.random() * 0.4,
                opacity: 0.4 + Math.random() * 0.3,
                force3D: true,
                willChange: "transform, opacity"
            });

            // Falling animation like snow/rain
            gsap.to(shape, {
                y: window.innerHeight + 200, // Fall past bottom
                x: randomX + (Math.random() * 100 - 50), // Slight horizontal drift
                rotation: Math.random() * 360 - 180, // Gentle rotation
                duration: duration,
                delay: delay,
                repeat: -1,
                ease: "none", // Constant speed like falling snow
                onRepeat: function() {
                    // Reset to new random position for continuous effect
                    const newRandomX = Math.random() * containerWidth;
                    gsap.set(shape, {
                        x: newRandomX,
                        y: -100 - Math.random() * 200,
                        rotation: Math.random() * 360
                    });
                }
            });

            // Subtle opacity pulsing
            gsap.to(shape, {
                opacity: 0.2 + Math.random() * 0.4,
                duration: 2 + Math.random() * 2,
                delay: delay,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });

        // Performance optimization: pause ONLY hero shape tweens when hero off-screen
        // (not the global timeline — that would freeze every gsap animation site-wide,
        // including the CTA falling shapes further down the page).
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                shapes.forEach((s) => {
                    const tweens = gsap.getTweensOf(s);
                    tweens.forEach((t) => entry.isIntersecting ? t.play() : t.pause());
                });
            });
        }, { threshold: 0.1 });

        observer.observe(hero);
    }

    // Initial call
    applyParallax();
}

// Diagonal wind-blown falling shapes for CTA section
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

// Diagonal wind-blown falling shapes for CTA section - How It Works Page
function initCtaFallingShapesHowItWorks() {
    const ctaCard = document.querySelector('.cta-section-how-it-works .cta-card-how-it-works');
    if (!ctaCard) return;
    const container = ctaCard.querySelector('.cta-falling-shapes-how-it-works');
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

// Diagonal wind-blown falling shapes for CTA section - Benefits Page
function initCtaFallingShapesBenefits() {
    const ctaCard = document.querySelector('.cta-section-benefits .cta-card-benefits');
    if (!ctaCard) return;
    const container = ctaCard.querySelector('.cta-falling-shapes-benefits');
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

// Safe scroll reveal animations - Section-based observation (matching benefits.html approach)
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

    // Observe all sections including hero and process sections
    const sections = document.querySelectorAll('.hero, .project-objective-section-how-it-works, .solution-section-how-it-works, .learning-methodology-section-how-it-works, .skill-areas-section-how-it-works, .participant-support-section-how-it-works, .implementation-activities-section-how-it-works, .cta-section, .site-footer');
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

    // Safety fallback: Force visibility after 2 seconds
    setTimeout(() => {
        document.querySelectorAll('.scroll-reveal-safe, .scroll-reveal-scale, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
            if (!el.classList.contains('is-visible')) {
                el.classList.add('is-visible');
            }
        });
    }, 2000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initFallbacks();
    initNavbarAnimations();
    initSafeScrollReveal();
    initNavbarBrandHandler();
    initCtaFallingShapes();
    initCtaFallingShapesHowItWorks();
    initCtaFallingShapesBenefits();
    initInteractionAnimations();
    initMobileMenu();
    initPerformanceOptimizations();
    initHeroLightOrbsAnimation();
    initSmoothAutoHide();
    initHeroParallax();
    initCareerPathwaysTimeline();

    // Simple animations
    setTimeout(() => {
        const heroElements = document.querySelectorAll(".hero .reveal-on-load");
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add("is-visible");
            }, index * 200);
        });

        const staggerSections = document.querySelectorAll(".hero-reveal-on-load");
        staggerSections.forEach((section) => {
            section.classList.add("hero-revealed");
        });
    }, 300);

    // Scroll animations
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll(".scroll-reveal").forEach((el) => {
            observer.observe(el);
        });
    }

    // Counter animations (count up from 0 to data-target when visible)
    const counters = document.querySelectorAll(".counter");
    if (counters.length) {
        const animateCounter = (el) => {
            const target = parseFloat(el.dataset.target);
            if (isNaN(target)) return;
            const original = el.textContent.trim();
            const suffix = original.replace(/^[\d.,\s]+/, "");
            const duration = 1800;
            const startTime = performance.now();
            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
            const isInt = Number.isInteger(target);
            const tick = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutCubic(progress);
                const value = target * eased;
                el.textContent = (isInt ? Math.floor(value) : value.toFixed(1)) + suffix;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = (isInt ? target : target.toFixed(1)) + suffix;
                }
            };
            requestAnimationFrame(tick);
        };

        if ("IntersectionObserver" in window) {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            counters.forEach((c) => {
                c.textContent = "0" + (c.textContent.trim().replace(/^[\d.,\s]+/, ""));
                counterObserver.observe(c);
            });
        } else {
            counters.forEach(animateCounter);
        }
    }

    // Feature card reveal (IntersectionObserver — no GSAP dependency, never gets stuck invisible)
    const featureCards = document.querySelectorAll(".feature-card");
    if (featureCards.length) {
        featureCards.forEach((card) => card.classList.add("feature-card-pre"));

        if ("IntersectionObserver" in window) {
            const featureObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        const idx = Array.from(featureCards).indexOf(entry.target);
                        setTimeout(() => entry.target.classList.add("feature-card-in"), idx * 100);
                        featureObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
            featureCards.forEach((card) => featureObserver.observe(card));
        } else {
            featureCards.forEach((card) => card.classList.add("feature-card-in"));
        }

        // Safety net: if anything goes wrong, force-show cards after 2.5s
        setTimeout(() => {
            featureCards.forEach((card) => card.classList.add("feature-card-in"));
        }, 2500);
    }

    if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
    }
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});

// Hero light orbs animation for inner-page heroes (How It Works + Team + Benefits)
function initHeroLightOrbsAnimation() {
    const heroSections = document.querySelectorAll('.hero-how-it-works, .hero-team, .hero-benefits');
    if (!heroSections.length) {
        console.log('Hero section not found');
        return;
    }

    if (typeof gsap === 'undefined') {
        console.log('GSAP not available');
        return;
    }

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

// Career Pathways Timeline - Scroll-driven animation with GPU-accelerated transform
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
