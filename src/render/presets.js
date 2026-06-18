export const PRESETS = [
  {
    id: "radha-original",
    name: "Radha Original",
    colors: {
      background: "#FFFFFF",
      circle1: "#0A1F44",
      circle2: "#87CEFA",
      circle3: "#FFD700",
      srColor: "#FF4433",
      nameColor: "#FF4433",
      auraColor: "#FFD700",
    },
  },
  {
    id: "krsna-original",
    name: "Krsna Original",
    colors: {
      background: "#FFFFFF",
      circle1: "#0A1F44",
      circle2: "#87CEFA",
      circle3: "#FFD700",
      srColor: "#FF4433",
      nameColor: "#FF4433",
      auraColor: "#87CEFA",
    },
  },
  {
    id: "blue-gold",
    name: "Blue / Gold",
    colors: {
      background: "#07111F",
      circle1: "#0B2D57",
      circle2: "#1D6FA3",
      circle3: "#F4C430",
      srColor: "#FFF7D6",
      nameColor: "#FFF7D6",
      auraColor: "#F4C430",
    },
  },
  {
    id: "pink-gold",
    name: "Pink / Gold",
    colors: {
      background: "#FFF7FB",
      circle1: "#7B1E57",
      circle2: "#E46AA5",
      circle3: "#F7C948",
      srColor: "#FFFFFF",
      nameColor: "#FFFFFF",
      auraColor: "#E46AA5",
    },
  },
  {
    id: "midnight-green-silver",
    name: "Midnight Green / Silver",
    colors: {
      background: "#06110E",
      circle1: "#0B2A21",
      circle2: "#2E6B57",
      circle3: "#C9D3D0",
      srColor: "#F4F7F5",
      nameColor: "#F4F7F5",
      auraColor: "#C9D3D0",
    },
  },
  {
    id: "red-blue",
    name: "Red / Blue",
    colors: {
      background: "#F8FAFC",
      circle1: "#163B73",
      circle2: "#D62839",
      circle3: "#F9DC5C",
      srColor: "#FFFFFF",
      nameColor: "#FFFFFF",
      auraColor: "#D62839",
    },
  },
  {
    id: "golden-moon",
    name: "Golden Moon",
    colors: {
      background: "#101010",
      circle1: "#2B2118",
      circle2: "#8B6F3D",
      circle3: "#F7E7A6",
      srColor: "#2B2118",
      nameColor: "#2B2118",
      auraColor: "#F7E7A6",
    },
  },
];

export function getPreset(presetId) {
  return PRESETS.find((preset) => preset.id === presetId) || PRESETS[0];
}
