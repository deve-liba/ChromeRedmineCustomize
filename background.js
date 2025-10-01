// Background service worker for Redmine Injector
// Handles script injection requests from content scripts

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'injectScript') {
        // Use chrome.scripting.executeScript to inject code into the page's main world
        // This bypasses CSP restrictions because the extension has elevated privileges
        chrome.scripting.executeScript({
            target: {tabId: sender.tab.id},
            world: 'MAIN', // Execute in the page's main world, not isolated content script world
            func: executeCustomScript,
            args: [request.code, request.id]
        }).then(() => {
            sendResponse({success: true});
        }).catch((error) => {
            console.error('Error injecting script (id: ' + request.id + '):', error);
            sendResponse({success: false, error: error.message});
        });

        // Return true to indicate we'll send response asynchronously
        return true;
    }
});

// This function will be serialized and executed in the page's main world
// It runs with the page's JavaScript context, not the extension's
function executeCustomScript(code, id) {
    try {
        // Create a script element to ensure code runs in true global scope
        // This makes all defined functions accessible from inline event handlers
        // Using script tag injection instead of eval ensures functions are defined
        // on the window object and can be called from onclick attributes
        const script = document.createElement('script');
        script.textContent = code;
        script.setAttribute('data-redmine-customize-id', id);
        (document.head || document.documentElement).appendChild(script);
        script.remove(); // Clean up the script tag after execution
        console.log('[Redmine Customize] Script executed successfully (id: ' + id + ')');
    } catch (error) {
        console.error('[Redmine Customize] Error executing custom script (id: ' + id + '):', error);
    }
}
