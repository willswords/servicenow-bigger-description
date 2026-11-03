(function() {
    'use strict';

    // Filled in from the options page by bridge.js; nothing is resized until
    // the settings arrive.
    let height = null;
    let selector = '';

    document.addEventListener('snbd:settings', (event) => {
        const settings = JSON.parse(event.detail);
        height = settings.height + 'px';
        selector = settings.fields
            .map(field => `textarea[id*="${CSS.escape(field)}"] + .tox-tinymce`)
            .join(', ');
    });
    document.dispatchEvent(new CustomEvent('snbd:request-settings'));

    // Collect shadow roots as the page creates them, so each check only looks
    // inside known roots instead of walking every element on the page.
    // WeakRefs let roots from closed forms be garbage collected.
    const rootRefs = new Set([new WeakRef(document)]);
    const originalAttachShadow = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function(...args) {
        const root = originalAttachShadow.apply(this, args);
        rootRefs.add(new WeakRef(root));
        return root;
    };

    // min-height (rather than height) doesn't fight TinyMCE, so the editor can
    // still grow and be drag-resized. Each editor is only touched again if the
    // height setting changes.
    const appliedHeight = new WeakMap();

    function resizeEditorsIn(root) {
        for (const editor of root.querySelectorAll(selector)) {
            if (appliedHeight.get(editor) === height) continue;
            editor.style.setProperty('min-height', height, 'important');
            const iframe = editor.querySelector('.tox-edit-area__iframe');
            if (iframe) iframe.style.height = '100%';
            appliedHeight.set(editor, height);
        }
    }

    setInterval(() => {
        if (!height || !selector) return;
        for (const ref of rootRefs) {
            const root = ref.deref();
            if (!root) {
                rootRefs.delete(ref);
                continue;
            }
            if (root.host && !root.host.isConnected) continue;
            resizeEditorsIn(root);
        }
    }, 1000);
})();
