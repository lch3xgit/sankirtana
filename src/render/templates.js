export const TEMPLATES = {
  radha: {
    id: "radha",
    label: "Sri Radha",
    file: "templates/sri-radha.svg",
    filenameBase: "sri-radha",
  },
  krsna: {
    id: "krsna",
    label: "Sri Krsna",
    file: "templates/sri-krsna.svg",
    filenameBase: "sri-krsna",
  },
};

const templateCache = new Map();

export async function loadTemplate(templateId) {
  const template = TEMPLATES[templateId] || TEMPLATES.radha;

  if (!templateCache.has(template.id)) {
    const response = await fetch(template.file);
    if (!response.ok) {
      throw new Error(`Unable to load ${template.file}`);
    }
    templateCache.set(template.id, await response.text());
  }

  return templateCache.get(template.id);
}

export function getTemplateMeta(templateId) {
  return TEMPLATES[templateId] || TEMPLATES.radha;
}
