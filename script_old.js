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

// Global animation settings
const animationDefaults = {
    duration: 0.8,
    ease: "power2.out"
};

// Set GSAP defaults
gsap.defaults(animationDefaults);

// Hero Section Animations
function initHeroAnimations() {
    // Hero title animation
    gsap.from(".hero-title", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3
    });

    // Hero subtitle animation
    gsap.from(".hero-subtitle", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.6
    });

    // Hero buttons animation
    gsap.from(".hero-buttons .btn", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.9,
        stagger: 0.2
    });

    // Hero stats animation
    gsap.from(".hero-stats .stat-item", {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        delay: 1.2,
        stagger: 0.2
    });

    // Floating card animation
    gsap.to(".floating-card", {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });

    // Parallax effect for hero background
    gsap.to(".hero", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
}

// Counter Animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (element.dataset.target.includes('.')) {
            element.textContent = current.toFixed(1) + element.textContent.replace(/[0-9.]/g, '');
        } else {
            element.textContent = Math.floor(current) + element.textContent.replace(/\d/g, '');
        }
    }, 16);
}

// Scroll-triggered animations
function initScrollAnimations() {
    // Fade in elements
    gsap.utils.toArray(".fade-in").forEach((element, index) => {
        gsap.from(element, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Stagger animations for cards
    gsap.utils.toArray(".feature-card").forEach((card, index) => {
        gsap.from(card, {
            y: 80,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none reverse"
            },
            delay: index * 0.15
        });
    });

    // Stat cards stagger animation
    gsap.from(".stat-card", {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.1,
        scrollTrigger: {
            trigger: ".problem-stats",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });

    // Counter animations
    gsap.utils.toArray(".counter").forEach(counter => {
        ScrollTrigger.create({
            trigger: counter,
            start: "top 80%",
            onEnter: () => {
                const target = parseFloat(counter.dataset.target);
                animateCounter(counter, target);
            },
            once: true
        });
    });

    // Skill items animation
    gsap.from(".skill-item", {
        x: -50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".skill-areas",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
        }
    });
}

// Navbar animations
function initNavbarAnimations() {
    // Navbar background on scroll
    ScrollTrigger.create({
        start: "top -80",
        end: 99999,
        toggleClass: {className: "navbar-scrolled", targets: ".navbar"}
    });

    // Smooth scroll for anchor links - using exact Bine implementation
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
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        button.addEventListener('click', () => {
            gsap.to(button, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        });
    });

    // Card hover effects
    document.querySelectorAll('.feature-card, .stat-card, .team-card, .testimonial-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -10,
                scale: 1.02,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
}

// Progress bar animations
function initProgressAnimations() {
    gsap.utils.toArray(".progress-bar").forEach(bar => {
        const width = bar.style.width;
        
        ScrollTrigger.create({
            trigger: bar,
            start: "top 80%",
            onEnter: () => {
                gsap.fromTo(bar, 
                    { width: "0%" },
                    { 
                        width: width,
                        duration: 1.5,
                        ease: "power2.out"
                    }
                );
            },
            once: true
        });
    });
}

// Text reveal animations
function initTextAnimations() {
    // Split text for reveal effect (for headings)
    gsap.utils.toArray("h2, h3, h4").forEach(heading => {
        gsap.from(heading, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: heading,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

// Page load animations
function initPageLoadAnimations() {
    // Fade in page content
    gsap.from("body", {
        opacity: 0,
        duration: 0.5,
        ease: "power1.out"
    });

    // Animate navbar
    gsap.from(".navbar", {
        y: -100,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.2
    });
}

// Form handlers (placeholder functions)
function showEnrollmentForm() {
    // Add a nice animation before showing alert
    gsap.to(event.target, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
            alert('Enrollment form would open here. This is a demo website.');
        }
    });
}

function showAssessmentForm() {
    gsap.to(event.target, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: () => {
            alert('Skills assessment form would open here. This is a demo website.');
        }
    });
}

function showCareersPage() {
    alert('Careers page would open here. This is a demo website.');
}

function showVolunteerForm() {
    alert('Volunteer application form would open here. This is a demo website.');
}

// Mobile menu handling
function initMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => {
            const isOpen = navbarCollapse.classList.contains('show');
            
            if (!isOpen) {
                gsap.from(".navbar-nav .nav-link", {
                    y: 20,
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.1,
                    ease: "power2.out"
                });
            }
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navbarCollapse.classList.remove('show');
            });
        });
    }
}

// Performance optimization - using Bine's approach
function initPerformanceOptimizations() {
    // Device detection for platform-specific polish
    const isAndroid = /Android/i.test(navigator.userAgent || "");
    const isIOS =
        /iPad|iPhone|iPod/i.test(navigator.userAgent || "") ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOS) {
        document.body.classList.add("ios-device");
    }

    if (isAndroid) {
        document.body.classList.add("android-device");
    }

    // Reduce motion for users who prefer it
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        gsap.globalTimeline.timeScale(0.1);
    }

    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            gsap.globalTimeline.pause();
        } else {
            gsap.globalTimeline.resume();
        }
    });
}

// Fallback for when JavaScript is disabled
function initFallbacks() {
    // Add no-js class for CSS fallbacks
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
}

// Initialize everything when DOM is loaded - EXACT BINE APPROACH
document.addEventListener('DOMContentLoaded', function() {
    initFallbacks();
    initNavbarAnimations();
    initInteractionAnimations();
    initMobileMenu();
    initPerformanceOptimizations();

    // Lenis works regardless of Windows animation settings - just like Bine

    // Simple animations (independent of Lenis)
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

    // Scroll animations (independent of Lenis)
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

    // GSAP animations (independent of Lenis)
    if (bineLenis) {
        gsap.utils.toArray(".feature-card").forEach((card, index) => {
            gsap.from(card, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%"
                }
            });
        });

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

// Console message for demo
console.log('%c🤖 AI Upskilling Philippines - Enhanced with GSAP & Lenis', 'color: #0066cc; font-size: 16px; font-weight: bold;');
console.log('%cSmooth scrolling and animations powered by GSAP and Lenis', 'color: #666; font-size: 12px;');
