export const EXPORT_SIZES = [
  {
    id: "square",
    label: "Square",
    width: 1080,
    height: 1080,
    description: "1080 x 1080",
  },
  {
    id: "portrait",
    label: "Portrait",
    width: 1080,
    height: 1350,
    description: "1080 x 1350",
  },
  {
    id: "story",
    label: "Story",
    width: 1080,
    height: 1920,
    description: "1080 x 1920",
  },
  {
    id: "wide",
    label: "Wide",
    width: 1600,
    height: 900,
    description: "1600 x 900",
  },
];

export function getExportSize(sizeId) {
  return EXPORT_SIZES.find((size) => size.id === sizeId) || EXPORT_SIZES[0];
}
