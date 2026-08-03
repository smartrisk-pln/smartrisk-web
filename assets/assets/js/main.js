/* -------------------------------------------
   ---------- SmartRisk - Shared JS ----------
   ------------------------------------------- */

// ---------- ACTIVE NAV ---------- //
function setActiveNav() {
    // Get the current URL path
    const parts = window.location.pathname.split('/').filter(Boolean);
    const currentLocation = parts[parts.length - 1] || '';
    const siteBaseURL = window.siteRootUrl;

    // Highlights home link when on the homepage
    // currentLocation is '' on homepage (no path segment after root); OR
    // currentLocation is 
    if ((currentLocation === '') || (currentLocation === siteBaseURL )) {
        const homeLink = [...document.querySelectorAll('.nav-links a')].find(a => {
            const href = a.getAttribute('href');
            try {
                const url = new URL(href);
                return url.pathname === window.location.pathname;
            } catch(e) { return false; }
        });
        if (homeLink) homeLink.classList.add('active');
    }

    // Highlights nav links based on currentLocation
    const menuLinks = document.querySelectorAll('.nav-links a');
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkPage = href.split('/').filter(Boolean).pop() || '';
        if (linkPage && linkPage === currentLocation) {
            link.classList.add('active');
        }
    });

}
setActiveNav();


// ---------- SCROLL REVEAL ---------- //
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ---------- HAMBURGER MENU ---------- //
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
    // Flag to prevent outside-click handler firing on the same click that opens the menu
    let menuJustOpened = false;
    
    // Toggle menu open/closed on hamburger click
    hamburger.addEventListener('click', () => {
        menuJustOpened = true;
        setTimeout(() => { menuJustOpened = false; }, 10)

        const navHeight = document.querySelector('nav').offsetHeight;
        mobileMenu.style.top = navHeight + 'px';
        const open = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open);
        // Prevent page scrolling behind the open menu
        // document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close menu when any link inside is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
        });
    });
    
    // Close menu when clicking outside the mobile menu
    document.addEventListener('click', e => {
        if (menuJustOpened) return;
        if (
            mobileMenu.classList.contains('open') &&
            !mobileMenu.contains(e.target) &&
            !hamburger.contains(e.target)
        ) {
            closeMenu();
        }
    });

    // Close menu on Escape key and return focus to hamburger
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMenu();
            hamburger.focus();
        }
    });
}



// ---------- SIDEBAR ---------- //
// Active highlight on scroll //
(function () {
    // Works for both services and projects pages
    const sidebar = document.querySelector('.services-sidebar, .projects-sidebar');
    if (!sidebar) return;

    const links    = sidebar.querySelectorAll('.sidebar-link');
    const sections = [];

    links.forEach(link => {
        const href = link.getAttribute('href');
        const id   = href && href.startsWith('#') ? href.slice(1) : null;
        if (id) {
            const el = document.getElementById(id);
            if (el) sections.push({ el, link });
        }
    });

    if (!sections.length) return;

    const setActive = (link) => {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    };

    // IntersectionObserver: highlight the section that occupies the most viewport
    const sidebarObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const match = sections.find(s => s.el === entry.target);
                    if (match) setActive(match.link);
                }
            });
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(s => sidebarObserver.observe(s.el));
})();



// ---------- CONTACT FORM ---------- //
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Attaching submit handler if a form is on the page 
    // AJAX form submission - page doesn't reload on submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn    = form.querySelector('.btn-submit');
        const status = document.getElementById('form-status');

        btn.textContent = 'Sending...';
        btn.disabled    = true;
        setButtonState(btn, 'state-sending');

        try {
            const res = await fetch(form.action, {
                method  : 'POST',
                body    : new FormData(form),
                headers : { 'Accept': 'application/json' }
            });
            if (res.ok) {
                btn.textContent = 'Message Sent ✓';
                setButtonState(btn, 'state-success');
                if (status) 
                    status.textContent = 'Your message has been sent. We\'ll be in touch soon.';
                form.reset();
                // Reset button to default state after 5 seconds
                setTimeout(() => {
                    btn.textContent = 'Send Message';
                    setButtonState(btn, null); // null removes all state classes
                    if (status) 
                        status.textContent = '';
                    btn.disabled = false;
                }, 5000);
            } else { throw new Error(); }
        } catch {
            btn.textContent = 'Try again.';
            setButtonState(btn, 'state-error');
            if (status) 
                status.textContent = 'Something went wrong. Please try again or email us directly.';
            btn.disabled = false;
        }
    });
});




// ---------- HELPERS ---------- //
function setButtonState(btn, state) {
    btn.classList.remove('state-sending', 'state-success', 'state-error');
    if (state) btn.classList.add(state);
}

function closeMenu() {
    setTimeout(() => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        // Re-enable page scrolling
        document.body.style.overflow = '';
    }, 250);
}

/* ---------- SET --nav-h DYNAMICALLY ---------- */
function setNavHeightVar() {
    const nav = document.querySelector('nav'); // adjust selector if your nav has a specific class/id
    if (nav) {
        document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
    }
}
setNavHeightVar();
window.addEventListener('resize', setNavHeightVar);
window.addEventListener('load', setNavHeightVar);

/* ---------- SET --sidebar-h DYNAMICALLY ---------- */
function setSidebarHeightVar() {
    // Only applies on mobile where sidebar is horizontal and stacked above content
    const sidebar = document.querySelector('.services-sidebar nav, .projects-sidebar nav');
    if (sidebar && window.innerWidth <= 780) {
        document.documentElement.style.setProperty('--sidebar-h', `${sidebar.offsetHeight}px`);
    } else {
        document.documentElement.style.setProperty('--sidebar-h', '0px');
    }
}
setSidebarHeightVar();
window.addEventListener('resize', setSidebarHeightVar);
window.addEventListener('load', setSidebarHeightVar);


/* ---------- DRAG-TO-SCROLL LOGO MARQUEE ---------- */
(function () {
    const wrap  = document.querySelector('.logo-marquee-wrap');
    const track = document.querySelector('.logo-marquee-track');
    if (!wrap || !track) return;

    // Speed in px/frame (~60fps). Matches feel of CSS 80s animation.
    const SPEED       = 1;
    const RESUME_DELAY = 500; // ms after drag release before auto-scroll resumes

    let offset        = 0;
    let isDragging    = false;
    let startX        = 0;
    let dragOffset    = 0;
    let rafId         = null;
    let resumeTimer   = null;
    let isPaused      = false;

    // Get the width of one set (half the track) for seamless looping
    function getSetWidth() {
        const set = track.querySelector('.logo-marquee-set');
        return set ? set.offsetWidth : track.scrollWidth / 4;
    }

    // Cancel the CSS animation entirely; JS drives it from now on
    track.style.animation = 'none';
    track.style.willChange = 'transform';

    function tick() {
        if (!isDragging && !isPaused) {
            offset -= SPEED;
            // Seamless loop: when we've scrolled one full set width, reset
            const setWidth = getSetWidth();
            if (Math.abs(offset) >= setWidth) {
                offset += setWidth;
            }
        }
        track.style.transform = `translateX(${offset}px)`;
        rafId = requestAnimationFrame(tick);
    }

    // Start the loop
    rafId = requestAnimationFrame(tick);

    // --- Drag handlers ---
    function onDragStart(x) {
        isDragging  = true;
        startX      = x;
        dragOffset  = offset;
        clearTimeout(resumeTimer);
        track.style.cursor = 'grabbing';
    }

    function onDragMove(x) {
        if (!isDragging) return;
        offset = dragOffset + (x - startX);
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = '';
        // Brief pause after release so it doesn't immediately scroll away
        isPaused = true;
        resumeTimer = setTimeout(() => { isPaused = false; }, RESUME_DELAY);
    }

    // Mouse
    track.addEventListener('mousedown', e => {
        e.preventDefault();
        onDragStart(e.clientX);
    });
    window.addEventListener('mousemove', e => onDragMove(e.clientX));
    window.addEventListener('mouseup', onDragEnd);

    // Touch
    track.addEventListener('touchstart', e => {
        onDragStart(e.touches[0].clientX);
    }, { passive: true });
    track.addEventListener('touchmove', e => {
        onDragMove(e.touches[0].clientX);
    }, { passive: true });
    track.addEventListener('touchend', onDragEnd);

    // Pause on hover, resume on leave (replaces the CSS hover rule)
    wrap.addEventListener('mouseenter', () => { isPaused = true; });
    wrap.addEventListener('mouseleave', () => {
        if (!isDragging) isPaused = false;
    });
})();


/* ---------- HERO BACKGROUND SLIDER ---------- */
(function () {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;

    const track  = slider.querySelector('.hero-slider-track');
    const allSlides = track.querySelectorAll('.hero-slide'); // includes the trailing duplicate hero-slide
    const dots   = document.querySelectorAll('.hero-dot');
    const realCount = dots.length; // number of actual distinct slides
    const HOLD_MS = 3000; // how long each slide stays put before advancing

    let current = 0;     // can go up to realCount (the duplicate position)
    let holdTimer;
    let awaitingReset = false;

    function setTrackPosition(index, animate) {
        track.style.transition = animate ? '' : 'none';
        track.style.transform  = `translateX(-${index * 100}%)`;
        if (!animate) {
            void track.offsetWidth; // force reflow so the disabled transition actually applies
            track.style.transition = '';
        }
    }

    function updateDots(realIndex) {
        const activeDot = dots[current % realCount];
        if (activeDot) {
            activeDot.classList.remove('is-active');
            activeDot.setAttribute('aria-selected', 'false');
        }
        const nextDot = dots[realIndex];
        if (nextDot) {
            nextDot.classList.add('is-active');
            nextDot.setAttribute('aria-selected', 'true');
        }
    }

    function scheduleNext() {
        clearTimeout(holdTimer);
        holdTimer = setTimeout(advance, HOLD_MS);
    }

    // Always slides left, one step at a time; wraps via the duplicated first slide.
    // Does NOT schedule the following move itself, that only happens once this
    // move's transition has actually finished (see transitionend below), so the
    // next move can never overlap or race this one.
    function advance() {
        const next = current + 1;
        updateDots(next % realCount);
        setTrackPosition(next, true);
        current = next;
        if (current === realCount) {
            awaitingReset = true; // we've landed on the duplicate; snap back once the transition ends
        }
    }

    // Jumping directly to a slide via the dots (no wrap needed, just go straight there)
    function goToDot(index) {
        clearTimeout(holdTimer);
        updateDots(index);
        setTrackPosition(index, true);
        current = index;
        scheduleNext(); // covers the case where the clicked dot is already active (no transitionend fires)
    }

    track.addEventListener('transitionend', (e) => {
        if (e.propertyName !== 'transform') return;

        if (awaitingReset) {
            awaitingReset = false;
            current = 0;
            setTrackPosition(0, false); // instant, invisible snap back to the real first slide
        }

        scheduleNext(); // this move has now visually finished - start the next hold period
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goToDot(i));
    });

    if (realCount > 1) {
        scheduleNext();
    }
})();