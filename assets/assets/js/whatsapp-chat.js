/* ----------------------------------------------------
   ---------- SmartRisk - WhatsApp Widget JS ----------
   ---------------------------------------------------- */

/*  Markup (avatar, tooltip, button, icon), language text, wa.me link, and visibility are all handled server-side in `layouts/partials/whatsapp-chat.html`.
    This file only wires up the widget's runtime behavior:
    showing and hiding the tooltip, and remembering dismissal for the session.
    
    If the partial rendered nothing (e.g. on /404, where footer.html - )
*/

(function () {
    /* STORAGE_KEY: the key used in sessionStorage to remember whether the user has dismissed the tooltip this session.
    sessionStorage is cleared when the browser tab is closed,  unlike localStorage which persists indefinitely */
    var STORAGE_KEY = 'wa_tooltip_dismissed';
    
    /* TOOLTIP_DELAY: milliseconds before the tooltip card auto-opens after the page loads.
    Set to 0 to disable auto-open entirely. */
    var TOOLTIP_DELAY = 0;
    
    function init() {
        var tooltip = document.querySelector('.wa-tooltip');
        var closeBtn = document.querySelector('.wa-tooltip-close');
        var pulse = document.querySelector('.wa-pulse');
        var btn = document.querySelector('.wa-btn');
        
        if (!tooltip || !closeBtn || !pulse || !btn) return; // widget not rendered on this page

        var dismissed = sessionStorage.getItem(STORAGE_KEY) === '1';

        // ---------- TOOLTIP BEHAVIOR ---------- //
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

        if (TOOLTIP_DELAY > 0 && !dismissed) {
            setTimeout(showTooltip, TOOLTIP_DELAY);
        }
    }


    // ---------- INITIALIZE ---------- //
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init(); // DOM already ready (e.g. script loaded late)
    }
})();