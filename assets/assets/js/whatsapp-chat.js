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

    
    // ---------- WhatsApp icon ---------- //
    /* (inline SVG, reused for avatar + button) */
    var WA_ICON =
        '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M20.5129 3.4866C18.2882 1.24722 15.2597 -0.00837473 12.1032 4.20445e-05C5.54964 4.20445e-05 0.216056 5.33306 0.213776 11.8883C0.210977 13.9746 0.75841 16.0247 1.80085 17.8319L0.114014 23.9932L6.41672 22.34C8.15975 23.2898 10.1131 23.7874 12.0981 23.7874H12.1032C18.6556 23.7874 23.9897 18.4538 23.992 11.8986C24.0022 8.74248 22.7494 5.71347 20.5129 3.4866ZM12.1032 21.7768H12.0992C10.3294 21.7776 8.59195 21.3025 7.06888 20.4012L6.70803 20.1874L2.96836 21.1685L3.96713 17.52L3.73169 17.1461C2.74331 15.5709 2.22039 13.7484 2.22328 11.8889C2.22328 6.44185 6.65615 2.00783 12.1072 2.00783C14.7284 2.00934 17.2417 3.05207 19.0941 4.90662C20.9465 6.76117 21.9863 9.27564 21.9848 11.8969C21.9825 17.3456 17.5496 21.7768 12.1032 21.7768ZM17.5234 14.3755C17.2264 14.2267 15.7659 13.5085 15.4934 13.4064C15.2209 13.3044 15.0231 13.2576 14.8253 13.5552C14.6275 13.8528 14.058 14.5215 13.8847 14.7199C13.7114 14.9182 13.5381 14.9427 13.241 14.794C12.944 14.6452 11.9869 14.3316 10.8519 13.3198C9.96884 12.5319 9.36969 11.5594 9.19867 11.2618C9.02765 10.9642 9.18043 10.8057 9.32922 10.6552C9.46261 10.5224 9.62622 10.3086 9.77444 10.1348C9.92266 9.9609 9.97283 9.83776 10.0714 9.63938C10.1701 9.44099 10.121 9.26769 10.0469 9.1189C9.97283 8.97011 9.37824 7.50788 9.13083 6.9133C8.88969 6.3341 8.64513 6.4122 8.46271 6.40023C8.29169 6.39168 8.09102 6.38997 7.89264 6.38997C7.58822 6.39793 7.30097 6.53267 7.10024 6.76166C6.82831 7.05923 6.061 7.77752 6.061 9.23976C6.061 10.702 7.12532 12.1146 7.27354 12.313C7.42176 12.5114 9.36855 15.5117 12.3472 16.7989C12.9004 17.0375 13.4657 17.2468 14.0409 17.426C14.7523 17.654 15.3999 17.6204 15.9118 17.544C16.4819 17.4585 17.6694 16.8251 17.9173 16.1313C18.1653 15.4376 18.1648 14.8424 18.0884 14.7187C18.012 14.595 17.8204 14.5266 17.5234 14.3778V14.3755Z"/>' +
        '</svg>';
    
    
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
            '<div class="wa-avatar">' + WA_ICON + '</div>' +
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
        btn.innerHTML = WA_ICON;

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