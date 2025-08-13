Blockly.defineBlocksWithJsonArray([
  // 1. Behavior Trigger Block
  {
    "type": "behavior_trigger",
    "message0": "When %1 do %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "TRIGGER",
        "options": [
          ["Tap", "TapEvent"],
          ["Touch Start", "TouchStartEvent"],
          ["Touch End", "TouchEndEvent"],
          ["Face Found", "FaceFoundEvent"],
          ["Smile Started", "SmileStartedEvent"],
          ["On Enabled", "OnEnabled"],
          ["On Disabled", "OnDisabled"],
          ["On Start", "TurnOnEvent"],
          ["On Awake", "OnAwake"],
          ["On Custom Trigger", "CustomTrigger"],
          ["Animation End", "animationEnd"],
          ["Tween End", "tweenEnd"]
        ]
      },
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "colour": 230,
    "tooltip": "WHEN this event happens, do..."
  },

  // 2. Response: Set Text
  {
    "type": "behavior_set_text",
    "message0": "set %1 text to %2",
    "args0": [
      { "type": "field_input", "name": "TARGET", "text": "script.textComponent" },
      { "type": "input_value", "name": "TEXT"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Set a Text or Text3D component's text"
  },

  // 3. Response: Play Sound
  {
    "type": "behavior_play_sound",
    "message0": "play sound on %1",
    "args0": [
      { "type": "field_input", "name": "COMPONENT", "text": "script.audioComponent" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 60,
    "tooltip": "Play a sound on an AudioComponent"
  },

  // 4. Response: Show Hint
  {
    "type": "behavior_show_hint",
    "message0": "show hint %1 for %2 sec",
    "args0": [
      { "type": "field_dropdown", "name": "HINTID", "options": [
        ["Smile", "lens_hint_smile"], 
        ["Tap", "lens_hint_tap"],
        ["Tilt your head", "lens_hint_tilt_your_head"],
        ["Open mouth", "lens_hint_open_your_mouth"]
      ]},
      { "type": "field_number", "name": "DURATION", "value": 2, "min": 1 }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 100,
    "tooltip": "Show a device hint (on device)"
  },

  // 5. Response: Send Custom Trigger
  {
    "type": "behavior_send_trigger",
    "message0": "send custom trigger %1",
    "args0": [
      { "type": "field_input", "name": "TRIGGERNAME", "text": "my_custom_event" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 200,
    "tooltip": "Send a named trigger for other scripts"
  },

  // 6. Print/Log
  {
    "type": "behavior_print",
    "message0": "print %1",
    "args0": [
      { "type": "input_value", "name": "VALUE"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "Print to console"
  },

  // 7. String value (helper)
  {
    "type": "behavior_string",
    "message0": "\"%1\"",
    "args0": [
      { "type": "field_input", "name": "TXT", "text": "" }
    ],
    "output": "String",
    "colour": 160
  }
]);
