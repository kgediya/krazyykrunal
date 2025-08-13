// --- Generators ---

Blockly.JavaScript.forBlock['behavior_trigger'] = function(block, generator) {
  const trigger = block.getFieldValue('TRIGGER');
  const actions = generator.statementToCode(block, 'DO');
  if(trigger === "CustomTrigger") {
    // You can customize this further for custom trigger names in advanced mode
    return `global.behaviorSystem.addCustomTriggerResponse('my_custom_event', function(eventData){\n${actions}});\n`;
  }
  return `script.createEvent("${trigger}").bind(function(eventData){\n${actions}});\n`;
};

Blockly.JavaScript.forBlock['behavior_set_text'] = function(block, generator) {
  const target = block.getFieldValue('TARGET');
  const value = generator.valueToCode(block, 'TEXT', Blockly.JavaScript.ORDER_ATOMIC);
  return `${target}.text = ${value};\n`;
};

Blockly.JavaScript.forBlock['behavior_play_sound'] = function(block, generator) {
  const comp = block.getFieldValue('COMPONENT');
  return `${comp}.play(1);\n`;
};

Blockly.JavaScript.forBlock['behavior_show_hint'] = function(block, generator) {
  const hintId = block.getFieldValue('HINTID');
  const duration = block.getFieldValue('DURATION');
  return `let hc = script.getSceneObject().getComponent("Component.HintsComponent") || script.getSceneObject().createComponent("Component.HintsComponent");\nhc.showHint("${hintId}", ${duration});\n`;
};

Blockly.JavaScript.forBlock['behavior_send_trigger'] = function(block, generator) {
  const name = block.getFieldValue('TRIGGERNAME');
  return `global.behaviorSystem.sendCustomTrigger("${name}");\n`;
};

Blockly.JavaScript.forBlock['behavior_print'] = function(block, generator) {
  const value = generator.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ATOMIC);
  return `print(${value});\n`;
};

Blockly.JavaScript.forBlock['behavior_string'] = function(block, generator) {
  return [`"${block.getFieldValue('TXT')}"`, Blockly.JavaScript.ORDER_ATOMIC];
};

// --- Toolbox Setup ---

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: {
    kind: 'flyoutToolbox',
    contents: [
      { kind: 'block', type: 'behavior_trigger' },
      { kind: 'block', type: 'behavior_set_text' },
      { kind: 'block', type: 'behavior_play_sound' },
      { kind: 'block', type: 'behavior_show_hint' },
      { kind: 'block', type: 'behavior_send_trigger' },
      { kind: 'block', type: 'behavior_print' },
      { kind: 'block', type: 'behavior_string' },
      { kind: 'sep' },
      // Built-in logic, math, variable blocks for more advanced creators
      {
        "kind": "category",
        "name": "Logic",
        "colour": "#5C81A6",
        "contents": [
          {"kind": "block", "type": "controls_if"},
          {"kind": "block", "type": "logic_compare"},
          {"kind": "block", "type": "logic_operation"},
          {"kind": "block", "type": "logic_boolean"}
        ]
      },
      {
        "kind": "category",
        "name": "Math",
        "colour": "#5CA65C",
        "contents": [
          {"kind": "block", "type": "math_number"},
          {"kind": "block", "type": "math_arithmetic"},
          {"kind": "block", "type": "math_round"}
        ]
      },
      {
        "kind": "category",
        "name": "Variables",
        "colour": "#A65C81",
        "custom": "VARIABLE"
      }
    ]
  },
  grid: { spacing: 20, length: 3, colour: "#ddd", snap: true },
  scrollbars: true,
  trashcan: true
});

// --- Generate code into the code panel ---
function updateCode() {
  let code = Blockly.JavaScript.workspaceToCode(workspace);
  document.getElementById('codeArea').textContent = code || "// Start dragging blocks!";
}
workspace.addChangeListener(updateCode);

// --- Clipboard copy for generated code ---
document.getElementById('copyBtn').onclick = () => {
  const code = document.getElementById('codeArea').textContent;
  navigator.clipboard.writeText(code);
  document.getElementById('copyBtn').textContent = "Copied!";
  setTimeout(() => {
    document.getElementById('copyBtn').textContent = "Copy to Clipboard";
  }, 1500);
}

window.onload = updateCode;
