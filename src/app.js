import { PRESETS, getPreset } from "./render/presets.js";
import { EXPORT_SIZES, getExportSize } from "./render/sizes.js";
import { getTemplateMeta } from "./render/templates.js";
import { listEffects, renderPngBlob, renderSacredSvg } from "./render/svg-renderer.js";

const state = {
  templateId: "radha",
  presetId: "radha-original",
  effect: "flat",
  sizeId: "square",
  colors: { ...getPreset("radha-original").colors },
};

const elements = {};
const colorFields = [
  ["background", "background ......"],
  ["circle1", "outer circle ...."],
  ["circle2", "middle circle ..."],
  ["circle3", "inner circle ...."],
  ["srColor", "sri text ........"],
  ["nameColor", "name text ......."],
  ["auraColor", "aura color ......"],
];

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindElements();
  populateSelectors();
  buildColorControls();
  bindEvents();
  await renderHeaderMarks();
  await renderPreview();
}

function bindElements() {
  elements.templateSelect = document.querySelector("#template-select");
  elements.presetSelect = document.querySelector("#preset-select");
  elements.effectSelect = document.querySelector("#effect-select");
  elements.sizeSelect = document.querySelector("#size-select");
  elements.colorControls = document.querySelector("#color-controls");
  elements.preview = document.querySelector("#generator-preview");
  elements.previewLabel = document.querySelector("#preview-label");
  elements.sizeReadout = document.querySelector("#size-readout");
  elements.download = document.querySelector("#download-png");
  elements.status = document.querySelector("#status-line");
  elements.headerRadha = document.querySelector("#header-radha");
  elements.headerKrsna = document.querySelector("#header-krsna");
}

function populateSelectors() {
  PRESETS.forEach((preset) => {
    elements.presetSelect.add(new Option(preset.name, preset.id));
  });

  listEffects().forEach((effect) => {
    elements.effectSelect.add(new Option(effect.label, effect.id));
  });

  EXPORT_SIZES.forEach((size) => {
    elements.sizeSelect.add(new Option(`${size.label} [${size.description}]`, size.id));
  });

  elements.templateSelect.value = state.templateId;
  elements.presetSelect.value = state.presetId;
  elements.effectSelect.value = state.effect;
  elements.sizeSelect.value = state.sizeId;
}

function buildColorControls() {
  elements.colorControls.innerHTML = "";

  colorFields.forEach(([key, label]) => {
    const row = document.createElement("label");
    row.className = "color-row";
    row.innerHTML = `
      <span>${label}</span>
      <input type="color" data-color-key="${key}" value="${state.colors[key]}">
      <code>${state.colors[key]}</code>
    `;
    elements.colorControls.append(row);
  });
}

function bindEvents() {
  elements.templateSelect.addEventListener("change", async (event) => {
    state.templateId = event.target.value;

    if (state.templateId === "radha" && state.presetId === "krsna-original") {
      applyPreset("radha-original");
    } else if (state.templateId === "krsna" && state.presetId === "radha-original") {
      applyPreset("krsna-original");
    }

    await renderPreview();
  });

  elements.presetSelect.addEventListener("change", async (event) => {
    applyPreset(event.target.value);
    await renderPreview();
  });

  elements.effectSelect.addEventListener("change", async (event) => {
    state.effect = event.target.value;
    await renderPreview();
  });

  elements.sizeSelect.addEventListener("change", async (event) => {
    state.sizeId = event.target.value;
    await renderPreview();
  });

  elements.colorControls.addEventListener("input", async (event) => {
    const input = event.target.closest("input[type='color']");
    if (!input) {
      return;
    }

    state.colors[input.dataset.colorKey] = input.value;
    input.nextElementSibling.textContent = input.value.toUpperCase();
    await renderPreview();
  });

  elements.download.addEventListener("click", downloadPng);
}

function applyPreset(presetId) {
  const preset = getPreset(presetId);
  state.presetId = preset.id;
  state.colors = { ...preset.colors };
  elements.presetSelect.value = preset.id;

  elements.colorControls.querySelectorAll("input[type='color']").forEach((input) => {
    input.value = state.colors[input.dataset.colorKey];
    input.nextElementSibling.textContent = input.value.toUpperCase();
  });
}

async function renderHeaderMarks() {
  const [radhaSvg, krsnaSvg] = await Promise.all([
    renderSacredSvg({
      templateId: "radha",
      colors: getPreset("radha-original").colors,
      effect: "flat",
      sizeId: "square",
      transparentBackground: true,
    }),
    renderSacredSvg({
      templateId: "krsna",
      colors: getPreset("krsna-original").colors,
      effect: "flat",
      sizeId: "square",
      transparentBackground: true,
    }),
  ]);

  elements.headerRadha.innerHTML = radhaSvg;
  elements.headerKrsna.innerHTML = krsnaSvg;
}

async function renderPreview() {
  try {
    setStatus("rendering");
    const svg = await renderSacredSvg(state);
    const template = getTemplateMeta(state.templateId);
    const size = getExportSize(state.sizeId);
    elements.preview.innerHTML = svg;
    elements.preview.style.aspectRatio = `${size.width} / ${size.height}`;
    elements.previewLabel.textContent = template.label;
    elements.sizeReadout.textContent = `${size.width} x ${size.height}`;
    setStatus("ready");
  } catch (error) {
    elements.preview.innerHTML = "";
    setStatus(error.message);
  }
}

async function downloadPng() {
  try {
    elements.download.disabled = true;
    setStatus("preparing PNG");
    const blob = await renderPngBlob(state);
    const template = getTemplateMeta(state.templateId);
    const size = getExportSize(state.sizeId);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${template.filenameBase}-${state.presetId}-${size.id}.png`;
    document.body.append(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
    setStatus("downloaded");
  } catch (error) {
    setStatus(error.message);
  } finally {
    elements.download.disabled = false;
  }
}

function setStatus(message) {
  elements.status.textContent = `[${message}]`;
}
