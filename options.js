(function() {
    'use strict';

    const heightInput = document.getElementById('height');
    const fieldsInput = document.getElementById('fields');
    const status = document.getElementById('status');

    function show(settings) {
        heightInput.value = settings.height;
        fieldsInput.value = settings.fields.join('\n');
    }

    function setStatus(message, kind) {
        status.textContent = message;
        status.className = kind;
    }

    function save(settings) {
        chrome.storage.sync.set(settings, () => {
            show(settings);
            setStatus('Saved. Open ServiceNow pages update within a second.', 'ok');
        });
    }

    document.getElementById('save').addEventListener('click', () => {
        const height = Number(heightInput.value);
        if (!Number.isInteger(height) || height < 100 || height > 3000) {
            setStatus('Height must be a whole number from 100 to 3000.', 'error');
            return;
        }
        const fields = [...new Set(fieldsInput.value.split('\n').map(f => f.trim()).filter(Boolean))];
        save({ height, fields });
    });

    document.getElementById('reset').addEventListener('click', () => save(DEFAULT_SETTINGS));

    chrome.storage.sync.get(DEFAULT_SETTINGS, show);
})();
