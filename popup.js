// Popup JavaScript
document.addEventListener('DOMContentLoaded', function() {
  loadStatistics();
  setupEventListeners();
});

// Load statistics
function loadStatistics() {
  chrome.storage.sync.get(['customizations'], function(result) {
    const customizations = result.customizations || [];
    
    const totalCount = customizations.length;
    const enabledCount = customizations.filter(c => c.enabled).length;
    const disabledCount = totalCount - enabledCount;
    
    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('enabledCount').textContent = enabledCount;
    document.getElementById('disabledCount').textContent = disabledCount;
    
    // Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0]) {
        displayCurrentPageInfo(tabs[0], customizations);
      }
    });
  });
}

// Display current page information
function displayCurrentPageInfo(tab, customizations) {
  const url = new URL(tab.url);
  const hostname = url.hostname;
  const pathname = url.pathname;
  
  // Count matching customizations
  const matchingCustomizations = customizations.filter(function(custom) {
    if (!custom.enabled) {
      return false;
    }
    
    if (!matchesDomain(hostname, custom.domain)) {
      return false;
    }
    
    if (custom.pathPattern && !matchesPath(pathname, custom.pathPattern)) {
      return false;
    }
    
    return true;
  });
  
  const currentPageInfo = document.getElementById('currentPageInfo');
  const currentUrl = document.getElementById('currentUrl');
  const matchingCount = document.getElementById('matchingCount');
  
  currentUrl.textContent = hostname + pathname;
  
  if (matchingCustomizations.length > 0) {
    matchingCount.textContent = `✓ ${matchingCustomizations.length} 件のカスタマイズが適用されています`;
    matchingCount.style.color = '#27ae60';
    currentPageInfo.style.display = 'block';
  } else if (customizations.some(c => c.enabled)) {
    matchingCount.textContent = '✗ このページに適用されるカスタマイズはありません';
    matchingCount.style.color = '#e74c3c';
    currentPageInfo.style.display = 'block';
  }
}

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

// Setup event listeners
function setupEventListeners() {
  document.getElementById('openOptions').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
}
