// content.js runs in the page's own context, where extension storage isn't
// available, so this script reads the settings and hands them over as an event.
(function() {
    'use strict';

    function sendSettings() {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
            document.dispatchEvent(new CustomEvent('snbd:settings', {
                detail: JSON.stringify(settings)
            }));
        });
    }

    // content.js asks when it starts, in case it loaded after this script.
    document.addEventListener('snbd:request-settings', sendSettings);
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') sendSettings();
    });
    sendSettings();
})();
