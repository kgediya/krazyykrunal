window.GENXR_CONFIG = {
  // Use these defaults on startup unless user has local overrides.
  defaultProvider: "gemini",
  defaultModel: "",
  defaultEngine: "three",

  // When true, auto-inject debug key for selected provider.
  // Set false if you always want manual entry.
  preferDebugKey: true,

  // Optional speech-to-text model overrides for voice input fallback.
  voiceModels: {
    gemini: "",
    openai: ""
  },

  // Put your temporary debug keys here.
  // Do not commit real production keys.
  apiKeys: {
    gemini: "AIzaSyATjFaqpPvprkJI3znZzfYbO4FloYYCtt",
    openai: ""
  }
};
