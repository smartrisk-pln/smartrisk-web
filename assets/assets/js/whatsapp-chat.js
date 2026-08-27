/* ----------------------------------------------------
   ---------- SmartRisk - WhatsApp Widget JS ----------
   ---------------------------------------------------- */

(function () {
    // ---------- CONFIGURATION OBJECT ---------- //
    // All settings that may need changing
    var CONFIG = {
        /* Phone/WhatsApp number in international format: 
            - Include country code (62 for Indonesia)
            - NO plus sign (+)
            - NO spaces or dashes
            - Remove the leading 0 from the local number
            Example: 
                local 08123456789 -> international 628123456789
        */
        phone: '628118208123',

        /* Messages: the text prefilled in WhatsApp's compose box.
            One entry per language code. The visitor sees this text before sending and can edit it freely.
        */
        messages: {
            en: "Hello, I would like to inquire about SmartRisk's services.",
            id: "Halo, saya ingin bertanya mengenai layanan SmartRisk."
        },

        /* Tooltips: text shown inside the floating tooltip card. */
        tooltips: {
            en: "Chat with us on WhatsApp",
            id: "Chat dengan kami di WhatsApp"
        },

        /* agentName: name shown in the tooltip card header. */
        agentName: {
            en: "SmartRisk Team",
            id: "Tim SmartRisk"
        },

        /* agentSub: subtitle under the agent name in the tooltip. */
        agentSub: {
            en: "Typically replies within 1 business day",
            id: "Biasanya membalas dalam 1 hari kerja"
        },

        /* tooltipDelay: milliseconds before the tooltip card auto-opens after the page loads. 
        Set to 0 to disable auto-open entirely.
        */
        tooltipDelay: 3000,

        /* position: which corner the widget appears in. 
        'right' = bottom-right (default, most common)
        'left'  = bottom-left
        */
        position: 'right',

        /* showOnPages: if non-empty, widget ONLY shows on these page filenames.
        Leave empty [] to show on all pages.
        */
        showOnPages: [],
        
        /* hideOnPages: widget is NEVER shown on these pages.
        Takes priority over showOnPages.
        404.html is the error page where a chat widget would be out of place.
        Values are full paths (no trailing slash), matching getCurrentPage(), e.g. '/404', '/services', '/projects/portfolio', etc.
        */
        hideOnPages: ['/404'],
    };


    // ---------- CONSTANTS ---------- //
    /* STORAGE_KEY: the key used in sessionStorage to remember whether the user has dismissed the tooltip this session.
    sessionStorage is cleared when the browser tab is closed,  unlike localStorage which persists indefinitely */
    var STORAGE_KEY = 'wa_tooltip_dismissed';


    // ---------- HELPER: getLang() ---------- //
    /* Determines the current language to use for widget text and the WhatsApp pre-filled message.
    
    The site has no client-side language toggle. Switching EN/ID is a full page navigation to the translated page's own URL 
    (see layouts/partials/nav.html, which links to {{. RelPermalink }} of each page's .Translations).
    Hugo renders <html lang="{{ .Site.Language.Lang }}"> correctly on every page at build time, so document.documentElement.lang is always accurate on load. That is the only signal this widget needs. 
    */
    function getLang() {
        var html = document.documentElement.lang;
        if (html && CONFIG.messages[html]) return html;
        return 'en'; // fallback: show EN widget text and message 
    }


    // ---------- HELPER: getCurrentPage() ---------- //
    /* Returns the current page's full path, normalized (no trailing slash), e.g. '/404', '/services', '/projects/portfolio', etc.
    Used to check showOnPages / hideOnPages, which are written as full paths.
    */
    function getCurrentPage() {
        var path = window.location.pathname.replace(/\/+$/, '');
        return path === '' ? '/' : path;
    }


    // ---------- HELPER: shouldShow() ---------- //
    /* Returns true if the widget should render on the current page.
    hideOnPages is checked first and always prioritized. 
    If showOnPages is empty, show on every page that isn't hidden.
    If showOnPages has entries, show ONLY on pages listed there.
    */
    function shouldShow() {
        var page = getCurrentPage();
        if (CONFIG.hideOnPages.indexOf(page) !== -1) return false;
        if (CONFIG.showOnPages.length === 0) return true;
        return CONFIG.showOnPages.indexOf(page) !== -1;
    }


    // ---------- HELPER: buildWhatsAppURL(lang) ---------- //
    /* Builds the wa.me link with the pre-filled message, URL-encoded so spaces and punctuation don't break the URL.
    */
    function buildWhatsAppURL(lang) {
        var msg = encodeURIComponent(CONFIG.messages[lang] || CONFIG.messages.en);
        return 'https://wa.me/' + CONFIG.phone + '?text=' + msg;
    }

    
    // ---------- WhatsApp icon markup ---------- //
    /* The WhatsApp icon itself is in static/assets/icons/whatsapp-icon.svg and is applied via CSS mask-image on .wa-icon (in assets/assets/css/whatsapp-chat.css). This is just the reusable <span> markup for the 2 places the icon appears (avatar & widget). */
    var ICON_HTML =
        '<span class="wa-icon" aria-hidden="true"></span>';
    
    
    // ---------- MAIN: inject() ---------- //
    /* Builds and injects the entire widget (CSS, HTML, behavior) into the current page. 
    Styling comes from `assets/assets/css/whatsapp-chat/css`, loaded separately via <link> in head.html.
    Called once after the DOM is ready (see bottom of file). */
    function inject() {
        if (!shouldShow()) return;

        var lang  = getLang();

        /* CSS lives in assets/assets/css/whatsapp-chat.css, loaded via <link> in head.html -> no runtime <style> injection needed. */


        // ---------- BUILD DOM ---------- //
        var wrap = document.createElement('div');
        wrap.className = 'wa-wrap';
        if (CONFIG.position === 'left') wrap.classList.add('wa-left');

        var tooltip = document.createElement('div');
        tooltip.className = 'wa-tooltip';
        tooltip.setAttribute('role', 'dialog');
        tooltip.setAttribute('aria-modal', 'false');
        tooltip.setAttribute('aria-label', 'WhatsApp chat invitation');
        tooltip.id = 'wa-tooltip';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'wa-tooltip-close';
        closeBtn.setAttribute('aria-label', 'Dismiss chat invitation');
        closeBtn.textContent = '\u2715';

        var agentDiv = document.createElement('div');
        agentDiv.className = 'wa-agent';
        agentDiv.innerHTML = 
            '<div class="wa-avatar">' + ICON_HTML + '</div>' +
            '<div>' +
                '<div class="wa-agent-name">' + (CONFIG.agentName[lang] || CONFIG.agentName.en) + '</div>' + 
                '<div class="wa-agent-sub">' + (CONFIG.agentSub[lang] || CONFIG.agentSub.en) + '</div>' + 
            '</div>';
        
        var msgDiv = document.createElement('div');
        msgDiv.className = 'wa-msg';
        msgDiv.textContent = CONFIG.tooltips[lang] || CONFIG.tooltips.en;

        tooltip.appendChild(closeBtn);
        tooltip.appendChild(agentDiv);
        tooltip.appendChild(msgDiv);
        
        var btnWrap = document.createElement('div');
        btnWrap.className = 'wa-btn-wrap';

        var pulse = document.createElement('div');
        pulse.className = 'wa-pulse';
        pulse.setAttribute('aria-hidden', 'true');

        var btn = document.createElement('a');
        btn.className = 'wa-btn';
        btn.href = buildWhatsAppURL(lang);
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.setAttribute('aria-label', 'Open WhatsApp chat with SmartRisk');
        btn.innerHTML = ICON_HTML;

        btnWrap.appendChild(pulse);
        btnWrap.appendChild(btn);

        wrap.appendChild(tooltip);
        wrap.appendChild(btnWrap);
        document.body.appendChild(wrap);


        // ---------- TOOLTIP BEHAVIOR ---------- //
        var dismissed = sessionStorage.getItem(STORAGE_KEY) ===  '1';
        
        function showTooltip() {
            if (dismissed) return;
            tooltip.classList.add('visible');
            pulse.style.animationPlayState = 'paused';
        }

        function hideTooltip() {
            tooltip.classList.remove('visible');
            pulse.style.animationPlayState = 'running';
        }

        function dismiss() {
            dismissed = true;
            sessionStorage.setItem(STORAGE_KEY, '1');
            hideTooltip();
        }

        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation(); // don't let this re-trigger anything
            dismiss();
        });

        btn.addEventListener('click', function () {
            hideTooltip(); // visitor is heading to WhatsApp -> tooltip no longer needed
        });

        btn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') hideTooltip();
        });

        if (CONFIG.tooltipDelay > 0 && !dismissed) {
            setTimeout(showTooltip, CONFIG.tooltipDelay);
        }
    }


    // ---------- INITIALIZE ---------- //
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject(); // DOM already ready (e.g. script loaded late)
    }
})();