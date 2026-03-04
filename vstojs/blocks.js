Blockly.defineBlocksWithJsonArray([
  {
    "type": "behavior_trigger",
    "message0": "when %1 %2 do %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "TRIGGER",
        "options": [
          ["Lens Start", "OnStartEvent"],
          ["Turn On", "TurnOnEvent"],
          ["Turn Off", "TurnOffEvent"],
          ["Update", "UpdateEvent"],
          ["Late Update", "LateUpdateEvent"],
          ["Tap", "TapEvent"],
          ["Touch Start", "TouchStartEvent"],
          ["Touch Move", "TouchMoveEvent"],
          ["Touch End", "TouchEndEvent"],
          ["Custom Trigger", "CustomTrigger"]
        ]
      },
      {
        "type": "field_input",
        "name": "CUSTOM_TRIGGER",
        "text": "my_custom_event"
      },
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "colour": 230,
    "tooltip": "Lens Studio event entrypoint.",
    "helpUrl": ""
  },
  {
    "type": "behavior_set_text",
    "message0": "set %1 text to %2",
    "args0": [
      { "type": "field_input", "name": "TARGET", "text": "script.textComponent" },
      { "type": "input_value", "name": "TEXT" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Set text on Text/Text3D component.",
    "helpUrl": ""
  },
  {
    "type": "behavior_play_sound",
    "message0": "play sound on %1 volume %2",
    "args0": [
      { "type": "field_input", "name": "COMPONENT", "text": "script.audioComponent" },
      { "type": "field_number", "name": "VOLUME", "value": 1, "min": 0, "max": 1, "precision": 0.05 }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 60,
    "tooltip": "Play AudioComponent with volume.",
    "helpUrl": ""
  },
  {
    "type": "behavior_show_hint",
    "message0": "show hint %1 for %2 sec",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "HINTID",
        "options": [
          ["Smile", "lens_hint_smile"],
          ["Tap", "lens_hint_tap"],
          ["Tilt your head", "lens_hint_tilt_your_head"],
          ["Open mouth", "lens_hint_open_your_mouth"]
        ]
      },
      { "type": "field_number", "name": "DURATION", "value": 2, "min": 0.2, "precision": 0.1 }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 100,
    "tooltip": "Show Lens device hint.",
    "helpUrl": ""
  },
  {
    "type": "behavior_send_trigger",
    "message0": "send custom trigger %1",
    "args0": [
      { "type": "field_input", "name": "TRIGGERNAME", "text": "my_custom_event" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 200,
    "tooltip": "Send trigger via global.behaviorSystem.",
    "helpUrl": ""
  },
  {
    "type": "lens_call_api",
    "message0": "call script.api %1 with %2",
    "args0": [
      { "type": "field_input", "name": "METHOD", "text": "onPulse" },
      { "type": "input_value", "name": "ARG" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 300,
    "tooltip": "Safely call script.api method.",
    "helpUrl": ""
  },
  {
    "type": "behavior_wait",
    "message0": "wait %1 sec then %2",
    "args0": [
      { "type": "field_number", "name": "SECONDS", "value": 1, "min": 0, "precision": 0.1 },
      { "type": "input_statement", "name": "DO" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 285,
    "tooltip": "Delay actions using DelayedCallbackEvent.",
    "helpUrl": ""
  },
  {
    "type": "behavior_set_enabled",
    "message0": "set %1 enabled %2",
    "args0": [
      { "type": "field_input", "name": "TARGET", "text": "script.sceneObject" },
      {
        "type": "field_dropdown",
        "name": "ENABLED",
        "options": [
          ["true", "true"],
          ["false", "false"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "Toggle SceneObject/Component enabled flag.",
    "helpUrl": ""
  },
  {
    "type": "behavior_print",
    "message0": "print %1",
    "args0": [
      { "type": "input_value", "name": "VALUE" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "Print to Lens Logger.",
    "helpUrl": ""
  },
  {
    "type": "behavior_string",
    "message0": "\"%1\"",
    "args0": [
      { "type": "field_input", "name": "TXT", "text": "" }
    ],
    "output": "String",
    "colour": 160,
    "helpUrl": ""
  }
]);
