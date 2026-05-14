# AI Upskilling Philippines

**Built by Laxus.FRFR** | Powered by Windsurf & Framer

---

## ⚠️ Important Notice

This is a **sample project website** created for demonstration purposes only. This codebase is the intellectual property of LAXUS.FRFR. Unauthorized copying, distribution, or use of this code without explicit permission is strictly prohibited. If you're interested in this project or would like to collaborate, please reach out directly.

Let's build something great together—the right way.

---

## 🚀 Project Overview

**Note: This is a sample/demo website, not a real production application.**

AI Upskilling Philippines is a modern, responsive web application designed to help Filipino BPO workers transition into AI-driven roles. With 89% of traditional BPO jobs at risk of automation, this platform provides comprehensive upskilling programs to future-proof careers in the AI era.

### Key Features

- **Smooth Animations**: GSAP-powered animations with Lenis smooth scrolling for a premium user experience
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile devices
- **Interactive Elements**: 
  - Hero section with falling shapes and parallax effects
  - Scroll-reveal animations for content sections
  - Dynamic counter animations for statistics
  - Interactive cat mascot with speech bubbles
- **Multi-Page Architecture**:
  - **Home**: Landing page with problem/solution framework
  - **Process**: Detailed learning methodology and implementation activities
  - **Benefits**: Expected results and multi-level impact metrics
  - **Team**: Academic context and team structure
- **Performance Optimized**:
  - WebP images for faster loading
  - IntersectionObserver for efficient scroll animations
  - RAF-throttled scroll handlers
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation support

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries**:
  - GSAP (GreenSock Animation Platform) - Animations
  - Lenis - Smooth scrolling
  - Bootstrap 5 - UI framework
  - Font Awesome - Icons
- **Fonts**: Poppins (Google Fonts)

---

## 📁 Project Structure

```
AI Upskilling Philippines/
├── index.html              # Home page
├── process.html            # Process/Methodology page
├── benefits.html           # Benefits & Impact page
├── team.html               # Our Team page
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript (home page)
├── script-benefits.js      # JavaScript for benefits page
├── script-team.js          # JavaScript for team page
├── lenis.min.js            # Lenis smooth scroll library
└── images/                 # Image assets
```

---

## 🎨 Key Functionality

### Loading Screen
- Animated loading screen with progress bar
- Skips when navigating via "Home" button for smooth UX
- Appears on page reload and logo/brand clicks
- Clears URL parameters to ensure consistent reload behavior

### Navigation
- Fixed navbar with smooth auto-hide on scroll
- Active state indicators for current page
- Mobile-responsive hamburger menu
- Lenis scroll lock when mobile menu is open

### Animations
- Hero parallax effect with background movement
- Falling shapes animation (snow/rain effect)
- Light orbs with gentle floating motion
- Scroll-triggered reveal animations with staggered delays
- Counter animations for statistics
- Button hover effects with GSAP

### Interactive Elements
- Cat mascot with speech bubble notifications
- Tip notification system
- Form validation and submission handling
- Smooth scroll to anchor links

---

## 🚀 Getting Started

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No build process required—runs directly in the browser

---

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

---

## ⚡ Performance Notes

- All hero images optimized to WebP format (2560px max width)
- GSAP animations use `opacity` instead of `autoAlpha` for GPU-only compositing
- IntersectionObserver pauses animations when sections are off-screen
- RAF-throttled scroll handlers prevent layout thrashing

---

## 📧 Contact

For inquiries, collaboration opportunities, or permission requests regarding this sample project:

**Laxus.frfr**
- Facebook: [Laxus.frfr](https://www.facebook.com/laxus.frfr)
- Instagram: [@laxus.frfr](https://www.instagram.com/laxus.frfr)
- TikTok: [@laxus.frfr](https://www.tiktok.com/@laxus.frfr)

---

*© 2026 AI Upskilling Philippines. All rights reserved. This is a sample project for demonstration purposes only.*
