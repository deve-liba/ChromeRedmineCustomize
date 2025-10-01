// Content script for Redmine Injector
(async function () {
    'use strict';

    // Get current URL
    const currentUrl = window.location.href;
    const currentHostname = window.location.hostname;
    const currentPath = window.location.pathname;

    // Load configurations from storage
    chrome.storage.sync.get(['customizations'], function (result) {
        const customizations = result.customizations || [];

        // Filter and apply matching customizations
        customizations.forEach(function (custom) {
            if (!custom.enabled) {
                return;
            }

            // Check if domain matches
            if (!matchesDomain(currentHostname, custom.domain)) {
                return;
            }

            // Check if path matches (if specified)
            if (custom.pathPattern && !matchesPath(currentPath, custom.pathPattern)) {
                return;
            }

            // Apply CSS if provided
            if (custom.css && custom.css.trim()) {
                injectCSS(custom.css, custom.id);
            }

            // Apply JavaScript if provided
            if (custom.javascript && custom.javascript.trim()) {
                injectJavaScript(custom.javascript, custom.id);
            }
        });
    });

    // Check if hostname matches the domain pattern(s)
    function matchesDomain(hostname, patterns) {
        if (!patterns || patterns.trim() === '') {
            return true; // Empty pattern matches all
        }

        // Split by newlines to handle multiple domains
        const domainList = patterns.split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        if (domainList.length === 0) {
            return true; // No valid patterns, match all
        }

        // Check each pattern
        for (let pattern of domainList) {
            // Remove protocol and trailing slash if present
            pattern = pattern.replace(/^https?:\/\//, '').replace(/\/$/, '');

            // Check if it's a regex pattern (starts with ^ or ends with $, or contains unescaped regex chars)
            const isRegex = /^[\^]|[\$]$|[^\\][\[\]\(\)\{\}\+\?\|]/.test(pattern);

            try {
                let regex;
                if (isRegex) {
                    // Treat as JavaScript regex
                    regex = new RegExp(pattern, 'i');
                } else {
                    // Support wildcard matching: * becomes .*
                    const regexPattern = pattern
                        .split('*')
                        .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                        .join('.*');
                    regex = new RegExp('^' + regexPattern + '$', 'i');
                }

                if (regex.test(hostname)) {
                    return true;
                }
            } catch (e) {
                // Invalid regex, skip this pattern
                console.warn('Invalid domain pattern:', pattern, e);
            }
        }

        return false; // No patterns matched
    }

    // Check if path matches the pattern
    function matchesPath(path, pattern) {
        if (!pattern || pattern.trim() === '') {
            return true; // Empty pattern matches all
        }

        pattern = pattern.trim();

        // Check if it's a regex pattern (starts with ^ or ends with $, or contains unescaped regex chars)
        const isRegex = /^[\^]|[\$]$|[^\\][\[\]\(\)\{\}\+\?\|]/.test(pattern);

        try {
            let regex;
            if (isRegex) {
                // Treat as JavaScript regex
                regex = new RegExp(pattern, 'i');
            } else {
                // Support wildcard matching: * becomes .*
                const regexPattern = pattern
                    .split('*')
                    .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                    .join('.*');
                regex = new RegExp('^' + regexPattern, 'i');
            }

            return regex.test(path);
        } catch (e) {
            // Invalid regex, skip this pattern
            console.warn('Invalid path pattern:', pattern, e);
            return false;
        }
    }

    // Inject CSS into the page
    function injectCSS(css, id) {
        const style = document.createElement('style');
        style.textContent = css;
        style.setAttribute('data-redmine-customize-id', id);

        // Try to inject as early as possible
        if (document.head) {
            document.head.appendChild(style);
        } else {
            // If head doesn't exist yet, wait for it
            const observer = new MutationObserver(function (mutations, obs) {
                if (document.head) {
                    document.head.appendChild(style);
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, {childList: true, subtree: true});
        }
    }

    // Inject JavaScript by sending message to background service worker
    // The background worker uses chrome.scripting.executeScript with world:'MAIN'
    // This bypasses CSP restrictions completely
    function injectJavaScript(js, id) {
        chrome.runtime.sendMessage({
            action: 'injectScript',
            code: js,
            id: id
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error sending inject request (id: ' + id + '):', chrome.runtime.lastError);
            } else if (response && !response.success) {
                console.error('Error injecting script (id: ' + id + '):', response.error);
            }
        });
    }
})();
