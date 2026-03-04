const STORAGE_KEY = 'kustom_vstojs_workspace_v3';
const generator = Blockly.JavaScript;

const els = {
  codeArea: document.getElementById('codeArea'),
  copyBtn: document.getElementById('copyBtn'),
  saveBtn: document.getElementById('saveBtn'),
  clearBtn: document.getElementById('clearBtn'),
  downloadJsBtn: document.getElementById('downloadJsBtn'),
  downloadBlocksBtn: document.getElementById('downloadBlocksBtn'),
  importBlocksInput: document.getElementById('importBlocksInput'),
  workspaceStats: document.getElementById('workspaceStats'),
  statusText: document.getElementById('statusText'),
  autosaveState: document.getElementById('autosaveState'),
  toast: document.getElementById('toast')
};

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => els.toast.classList.remove('show'), 1800);
}

function debounce(fn, wait = 120) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function sanitizeIdentifier(raw, fallback) {
  const cleaned = String(raw || '').trim().replace(/[^a-zA-Z0-9_]/g, '_');
  return cleaned || fallback;
}

function parseScriptRef(ref) {
  const match = String(ref || '').trim().match(/^script\.([A-Za-z_][A-Za-z0-9_]*)$/);
  return match ? match[1] : '';
}

function blockUsesBehaviorSystem(block) {
  if (block.type === 'behavior_send_trigger') {
    return true;
  }
  if (block.type === 'behavior_trigger') {
    return block.getFieldValue('TRIGGER') === 'CustomTrigger';
  }
  return false;
}

function collectInputHints(currentWorkspace) {
  const hints = new Map();

  currentWorkspace.getAllBlocks(false).forEach((block) => {
    if (block.type === 'behavior_set_text') {
      const refName = parseScriptRef(block.getFieldValue('TARGET'));
      if (refName && !hints.has(refName)) {
        hints.set(refName, 'Component.Text');
      }
    }

    if (block.type === 'behavior_play_sound') {
      const refName = parseScriptRef(block.getFieldValue('COMPONENT'));
      if (refName && !hints.has(refName)) {
        hints.set(refName, 'Component.AudioComponent');
      }
    }

    if (block.type === 'behavior_set_enabled') {
      const refName = parseScriptRef(block.getFieldValue('TARGET'));
      if (refName && !hints.has(refName)) {
        hints.set(refName, 'SceneObject');
      }
    }
  });

  return Array.from(hints.entries()).map(([name, typeName]) => `//@input ${typeName} ${name}`);
}

function buildLensHeader(currentWorkspace) {
  const inputLines = collectInputHints(currentWorkspace);
  const needsBehaviorSystem = currentWorkspace.getAllBlocks(false).some(blockUsesBehaviorSystem);

  const lines = [
    '// Kustom VSToJS Lab',
    '// Lens Studio script generated from blocks',
    ''
  ];

  if (inputLines.length > 0) {
    lines.push('// Suggested Lens Studio inputs');
    lines.push(...inputLines);
    lines.push('');
  }

  if (needsBehaviorSystem) {
    lines.push('// Optional behavior system guard');
    lines.push('var kxBehaviorSystem = global.behaviorSystem || null;');
    lines.push('');
  }

  lines.push('// Generated logic');
  return lines.join('\n');
}

Blockly.JavaScript.forBlock['behavior_trigger'] = function(block, jsGenerator) {
  const trigger = block.getFieldValue('TRIGGER');
  const customName = sanitizeIdentifier(block.getFieldValue('CUSTOM_TRIGGER'), 'my_custom_event');
  const actions = jsGenerator.statementToCode(block, 'DO');

  if (trigger === 'CustomTrigger') {
    return [
      'if (kxBehaviorSystem) {',
      `  kxBehaviorSystem.addCustomTriggerResponse("${customName}", function(eventData) {`,
      `${actions}`.replace(/^/gm, '    '),
      '  });',
      '} else {',
      `  print("Missing global.behaviorSystem for trigger: ${customName}");`,
      '}',
      ''
    ].join('\n');
  }

  return `script.createEvent("${trigger}").bind(function(eventData) {\n${actions}});\n`;
};

Blockly.JavaScript.forBlock['behavior_set_text'] = function(block, jsGenerator) {
  const target = block.getFieldValue('TARGET').trim() || 'script.textComponent';
  const value = jsGenerator.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC) || '""';
  return `${target}.text = ${value};\n`;
};

Blockly.JavaScript.forBlock['behavior_play_sound'] = function(block) {
  const componentRef = block.getFieldValue('COMPONENT').trim() || 'script.audioComponent';
  const volume = Number(block.getFieldValue('VOLUME'));
  const safeVolume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 1;
  return `${componentRef}.play(${safeVolume});\n`;
};

Blockly.JavaScript.forBlock['behavior_show_hint'] = function(block) {
  const hintId = block.getFieldValue('HINTID');
  const duration = Math.max(0.1, Number(block.getFieldValue('DURATION')) || 2);
  return [
    'var hintsComponent = script.getSceneObject().getComponent("Component.HintsComponent") || script.getSceneObject().createComponent("Component.HintsComponent");',
    `hintsComponent.showHint("${hintId}", ${duration});`,
    ''
  ].join('\n');
};

Blockly.JavaScript.forBlock['behavior_send_trigger'] = function(block) {
  const triggerName = sanitizeIdentifier(block.getFieldValue('TRIGGERNAME'), 'my_custom_event');
  return [
    'if (kxBehaviorSystem) {',
    `  kxBehaviorSystem.sendCustomTrigger("${triggerName}");`,
    '} else {',
    `  print("Missing global.behaviorSystem for trigger: ${triggerName}");`,
    '}',
    ''
  ].join('\n');
};

Blockly.JavaScript.forBlock['lens_call_api'] = function(block, jsGenerator) {
  const methodName = sanitizeIdentifier(block.getFieldValue('METHOD'), 'onPulse');
  const arg = jsGenerator.valueToCode(block, 'ARG', Blockly.JavaScript.ORDER_NONE);
  const argList = arg ? arg : '';

  return [
    `if (script.api && typeof script.api.${methodName} === "function") {`,
    `  script.api.${methodName}(${argList});`,
    '} else {',
    `  print("Missing script.api method: ${methodName}");`,
    '}',
    ''
  ].join('\n');
};

Blockly.JavaScript.forBlock['behavior_wait'] = function(block, jsGenerator) {
  const sec = Math.max(0, Number(block.getFieldValue('SECONDS')) || 0);
  const actions = jsGenerator.statementToCode(block, 'DO');
  return [
    'var delayedEvent = script.createEvent("DelayedCallbackEvent");',
    'delayedEvent.bind(function() {',
    `${actions}`.replace(/^/gm, '  '),
    '});',
    `delayedEvent.reset(${sec});`,
    ''
  ].join('\n');
};

Blockly.JavaScript.forBlock['behavior_set_enabled'] = function(block) {
  const target = block.getFieldValue('TARGET').trim() || 'script.sceneObject';
  const enabled = block.getFieldValue('ENABLED') === 'true' ? 'true' : 'false';
  return `${target}.enabled = ${enabled};\n`;
};

Blockly.JavaScript.forBlock['behavior_print'] = function(block, jsGenerator) {
  const value = jsGenerator.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC) || '""';
  return `print(${value});\n`;
};

Blockly.JavaScript.forBlock['behavior_string'] = function(block) {
  const txt = block.getFieldValue('TXT').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return [`"${txt}"`, Blockly.JavaScript.ORDER_ATOMIC];
};

const workspace = Blockly.inject('blocklyDiv', {
  renderer: 'zelos',
  toolbox: {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Lens Events',
        colour: '#fffc00',
        contents: [
          { kind: 'block', type: 'behavior_trigger' },
          { kind: 'block', type: 'behavior_wait' },
          { kind: 'block', type: 'behavior_send_trigger' }
        ]
      },
      {
        kind: 'category',
        name: 'Lens Actions',
        colour: '#ffd447',
        contents: [
          { kind: 'block', type: 'behavior_set_text' },
          { kind: 'block', type: 'behavior_play_sound' },
          { kind: 'block', type: 'behavior_show_hint' },
          { kind: 'block', type: 'behavior_set_enabled' },
          { kind: 'block', type: 'lens_call_api' },
          { kind: 'block', type: 'behavior_print' }
        ]
      },
      {
        kind: 'category',
        name: 'Values',
        colour: '#ffe882',
        contents: [
          { kind: 'block', type: 'behavior_string' },
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'logic_boolean' }
        ]
      },
      {
        kind: 'category',
        name: 'Logic',
        colour: '#b5bac3',
        contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_negate' }
        ]
      },
      {
        kind: 'category',
        name: 'Math',
        colour: '#949aa8',
        contents: [
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_round' }
        ]
      },
      {
        kind: 'category',
        name: 'Variables',
        colour: '#d8dee9',
        custom: 'VARIABLE'
      }
    ]
  },
  grid: { spacing: 20, length: 2, colour: '#2d3038', snap: true },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.95,
    maxScale: 1.6,
    minScale: 0.45,
    scaleSpeed: 1.12
  },
  move: {
    drag: true,
    wheel: true
  },
  trashcan: true,
  scrollbars: true
});

function serializeWorkspace() {
  if (Blockly.serialization && Blockly.serialization.workspaces) {
    return Blockly.serialization.workspaces.save(workspace);
  }
  const xml = Blockly.Xml.workspaceToDom(workspace);
  return { xml: Blockly.Xml.domToText(xml), fallback: true };
}

function loadWorkspaceFromObject(data) {
  workspace.clear();

  if (data && data.fallback && typeof data.xml === 'string') {
    const xml = Blockly.Xml.textToDom(data.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
    return;
  }

  if (Blockly.serialization && Blockly.serialization.workspaces) {
    Blockly.serialization.workspaces.load(data, workspace);
  }
}

function buildLensCode() {
  const logicCode = generator.workspaceToCode(workspace).trim();
  if (!logicCode) {
    return '// Start dragging blocks to generate Lens Studio code';
  }

  return `${buildLensHeader(workspace)}\n\n${logicCode}`.trim();
}

function updateStatsAndCode() {
  const finalCode = buildLensCode();
  const blockCount = workspace.getAllBlocks(false).length;
  const lineCount = finalCode.split('\n').length;

  els.codeArea.value = finalCode;
  els.workspaceStats.textContent = `${blockCount} block${blockCount === 1 ? '' : 's'} • ${lineCount} line${lineCount === 1 ? '' : 's'}`;
  els.statusText.textContent = finalCode.includes('Generated logic') ? 'Lens-ready code synced' : 'Ready';
}

const debouncedRefresh = debounce(updateStatsAndCode, 120);
const debouncedAutosave = debounce(() => {
  try {
    const payload = serializeWorkspace();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    els.autosaveState.textContent = `Autosave: ${new Date().toLocaleTimeString()}`;
  } catch (err) {
    els.autosaveState.textContent = 'Autosave: failed';
  }
}, 260);

workspace.addChangeListener((event) => {
  if (event.isUiEvent) {
    return;
  }
  debouncedRefresh();
  debouncedAutosave();
});

function downloadText(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 250);
}

els.copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(els.codeArea.value);
    showToast('Lens JS copied');
  } catch (err) {
    showToast('Clipboard blocked in this browser');
  }
});

els.downloadJsBtn.addEventListener('click', () => {
  downloadText('lens-script.js', els.codeArea.value, 'application/javascript');
  showToast('Lens JS downloaded');
});

els.saveBtn.addEventListener('click', () => {
  const payload = JSON.stringify(serializeWorkspace(), null, 2);
  localStorage.setItem(STORAGE_KEY, payload);
  els.autosaveState.textContent = `Autosave: ${new Date().toLocaleTimeString()}`;
  showToast('Blocks saved locally');
});

els.downloadBlocksBtn.addEventListener('click', () => {
  const payload = JSON.stringify(serializeWorkspace(), null, 2);
  downloadText('kustom-vstojs-blocks.json', payload, 'application/json');
  showToast('Blocks JSON downloaded');
});

els.clearBtn.addEventListener('click', () => {
  const hasBlocks = workspace.getAllBlocks(false).length > 0;
  if (!hasBlocks || confirm('Clear all blocks from workspace?')) {
    workspace.clear();
    debouncedRefresh();
    showToast('Workspace cleared');
  }
});

els.importBlocksInput.addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    loadWorkspaceFromObject(data);
    debouncedRefresh();
    debouncedAutosave();
    showToast('Blocks loaded');
  } catch (err) {
    showToast('Invalid blocks JSON');
  } finally {
    els.importBlocksInput.value = '';
  }
});

window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    const payload = JSON.stringify(serializeWorkspace(), null, 2);
    downloadText('kustom-vstojs-blocks.json', payload, 'application/json');
    showToast('Blocks exported');
  }
});

(function init() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      loadWorkspaceFromObject(JSON.parse(saved));
      els.autosaveState.textContent = 'Autosave: restored';
    }
  } catch (err) {
    els.autosaveState.textContent = 'Autosave: restore failed';
  }

  updateStatsAndCode();
})();
