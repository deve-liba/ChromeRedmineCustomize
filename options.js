// Options page JavaScript
let customizations = [];
let editingIndex = -1;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadCustomizations();
  setupEventListeners();
});

// Load customizations from storage
function loadCustomizations() {
  chrome.storage.sync.get(['customizations'], function(result) {
    customizations = result.customizations || [];
    renderCustomizations();
  });
}

// Save customizations to storage
function saveCustomizations() {
  chrome.storage.sync.set({ customizations: customizations }, function() {
    console.log('Customizations saved');
  });
}

// Render customization list
function renderCustomizations() {
  const listElement = document.getElementById('customizationList');
  
  if (customizations.length === 0) {
    listElement.innerHTML = `
      <div class="empty-state">
        <p>カスタマイズが登録されていません</p>
        <p>「新規追加」ボタンをクリックして、最初のカスタマイズを作成してください。</p>
      </div>
    `;
    return;
  }

  listElement.innerHTML = '';
  
  customizations.forEach(function(custom, index) {
    const item = document.createElement('div');
    item.className = 'customization-item' + (custom.enabled ? '' : ' disabled');
    
    const statusBadge = custom.enabled 
      ? '<span class="status-badge enabled">有効</span>' 
      : '<span class="status-badge disabled">無効</span>';
    
    const hasCss = custom.css && custom.css.trim() ? '✓' : '✗';
    const hasJs = custom.javascript && custom.javascript.trim() ? '✓' : '✗';
    
    // Format domain display for multiple domains
    let domainDisplay = '(全て)';
    if (custom.domain && custom.domain.trim()) {
      const domains = custom.domain.split('\n').map(d => d.trim()).filter(d => d.length > 0);
      if (domains.length === 1) {
        domainDisplay = escapeHtml(domains[0]);
      } else if (domains.length > 1) {
        domainDisplay = escapeHtml(domains[0]) + ` <span style="color: #7f8c8d;">(+${domains.length - 1} 件)</span>`;
      }
    }
    
    item.innerHTML = `
      <div class="customization-header">
        <div class="customization-title">
          ${escapeHtml(custom.name)} ${statusBadge}
        </div>
        <div class="customization-actions">
          <button class="btn btn-success btn-toggle" data-index="${index}">
            ${custom.enabled ? '無効化' : '有効化'}
          </button>
          <button class="btn btn-primary btn-edit" data-index="${index}">編集</button>
          <button class="btn btn-danger btn-delete" data-index="${index}">削除</button>
        </div>
      </div>
      <div class="customization-info">
        <div class="info-row">
          <span class="info-label">ドメイン:</span>
          <span class="info-value">${domainDisplay}</span>
        </div>
        <div class="info-row">
          <span class="info-label">パス:</span>
          <span class="info-value">${escapeHtml(custom.pathPattern || '(全て)')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">CSS:</span>
          <span class="info-value">${hasCss}</span>
          <span class="info-label" style="margin-left: 20px;">JavaScript:</span>
          <span class="info-value">${hasJs}</span>
        </div>
      </div>
    `;
    
    listElement.appendChild(item);
  });

  // Attach event listeners to buttons
  document.querySelectorAll('.btn-edit').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      editCustomization(index);
    });
  });

  document.querySelectorAll('.btn-delete').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      deleteCustomization(index);
    });
  });

  document.querySelectorAll('.btn-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      toggleCustomization(index);
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Add new button
  document.getElementById('addNew').addEventListener('click', function() {
    openEditModal();
  });

  // Edit form submit
  document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    saveCurrentEdit();
  });

  // Cancel button
  document.getElementById('cancelBtn').addEventListener('click', function() {
    closeEditModal();
  });

  // Modal close buttons
  document.querySelectorAll('.close').forEach(function(btn) {
    btn.addEventListener('click', function() {
      closeAllModals();
    });
  });

  // Click outside modal to close
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      closeAllModals();
    }
  });

  // Import/Export buttons
  document.getElementById('importBtn').addEventListener('click', function() {
    openImportModal();
  });

  document.getElementById('exportBtn').addEventListener('click', function() {
    exportToFile();
  });

  document.getElementById('importConfirmBtn').addEventListener('click', function() {
    importFromFile();
  });

  document.getElementById('closeImportBtn').addEventListener('click', function() {
    closeImportModal();
  });
}

// Open edit modal
function openEditModal(index = -1) {
  editingIndex = index;
  const modal = document.getElementById('editModal');
  const title = document.getElementById('modalTitle');
  
  if (index >= 0) {
    // Edit existing
    title.textContent = 'カスタマイズを編集';
    const custom = customizations[index];
    document.getElementById('customName').value = custom.name;
    document.getElementById('customDomain').value = custom.domain || '';
    document.getElementById('customPath').value = custom.pathPattern || '';
    document.getElementById('customCss').value = custom.css || '';
    document.getElementById('customJavaScript').value = custom.javascript || '';
    document.getElementById('customEnabled').checked = custom.enabled;
  } else {
    // Add new
    title.textContent = '新規カスタマイズ';
    document.getElementById('editForm').reset();
    document.getElementById('customEnabled').checked = true;
  }
  
  modal.classList.add('show');
}

// Close edit modal
function closeEditModal() {
  document.getElementById('editModal').classList.remove('show');
  editingIndex = -1;
}

// Close all modals
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('show');
  });
}

// Save current edit
function saveCurrentEdit() {
  const name = document.getElementById('customName').value.trim();
  const domain = document.getElementById('customDomain').value.trim();
  const pathPattern = document.getElementById('customPath').value.trim();
  const css = document.getElementById('customCss').value;
  const javascript = document.getElementById('customJavaScript').value;
  const enabled = document.getElementById('customEnabled').checked;

  if (!name) {
    alert('名前を入力してください');
    return;
  }

  const customization = {
    id: editingIndex >= 0 ? customizations[editingIndex].id : generateId(),
    name: name,
    domain: domain,
    pathPattern: pathPattern,
    css: css,
    javascript: javascript,
    enabled: enabled
  };

  if (editingIndex >= 0) {
    customizations[editingIndex] = customization;
  } else {
    customizations.push(customization);
  }

  saveCustomizations();
  renderCustomizations();
  closeEditModal();
}

// Edit customization
function editCustomization(index) {
  openEditModal(index);
}

// Delete customization
function deleteCustomization(index) {
  if (confirm('このカスタマイズを削除してもよろしいですか？')) {
    customizations.splice(index, 1);
    saveCustomizations();
    renderCustomizations();
  }
}

// Toggle customization enabled state
function toggleCustomization(index) {
  customizations[index].enabled = !customizations[index].enabled;
  saveCustomizations();
  renderCustomizations();
}

// Open import modal
function openImportModal() {
  const modal = document.getElementById('importModal');
  document.getElementById('importFile').value = '';
  modal.classList.add('show');
}

// Close import modal
function closeImportModal() {
  document.getElementById('importModal').classList.remove('show');
}

// Export to file
function exportToFile() {
  const jsonData = JSON.stringify(customizations, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  a.href = url;
  a.download = `redmine-customizations-${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import from file
function importFromFile() {
  const fileInput = document.getElementById('importFile');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('ファイルを選択してください');
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const jsonData = e.target.result;
      const imported = JSON.parse(jsonData);
      
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format');
      }
      
      // Validate structure
      for (let item of imported) {
        if (!item.name || !item.id) {
          throw new Error('Invalid customization structure');
        }
      }
      
      if (confirm('既存の設定を上書きしてインポートしますか？\n（キャンセルすると既存の設定に追加されます）')) {
        customizations = imported;
      } else {
        // Merge: regenerate IDs to avoid conflicts
        imported.forEach(function(item) {
          item.id = generateId();
          customizations.push(item);
        });
      }
      
      saveCustomizations();
      renderCustomizations();
      closeImportModal();
      alert('インポートが完了しました');
    } catch (error) {
      alert('インポートに失敗しました: ' + error.message);
    }
  };
  
  reader.onerror = function() {
    alert('ファイルの読み込みに失敗しました');
  };
  
  reader.readAsText(file);
}

// Generate unique ID
function generateId() {
  return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
