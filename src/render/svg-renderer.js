import { getExportSize } from "./sizes.js";
import { loadTemplate } from "./templates.js";

const PLACEHOLDERS = {
  bgColor: "background",
  circle1Color: "circle1",
  circle2Color: "circle2",
  circle3Color: "circle3",
  srColor: "srColor",
  nameColor: "nameColor",
};

const EFFECTS = {
  flat: "Flat",
  glow: "Soft glow",
  aura: "Radial aura",
};

export const MARK_SCALE = 0.8;

// Experimental only. Layered Relief was tested but disabled pending better
// color-aware relief rendering.
const RELIEF_OFFSET = 10;
const RELIEF_SHADOW_OPACITY = 0.42;
const RELIEF_HIGHLIGHT_OPACITY = 0.2;

export function listEffects() {
  return Object.entries(EFFECTS).map(([id, label]) => ({ id, label }));
}

export async function renderSacredSvg({
  templateId,
  colors,
  effect = "flat",
  sizeId = "square",
  transparentBackground = false,
}) {
  const rawTemplate = await loadTemplate(templateId);
  const resolvedEffect = resolveEffect(effect);
  const colorized = applyColors(rawTemplate, colors);
  const extracted = extractSvgBody(colorized);
  const size = getExportSize(sizeId);
  const markDiameter = getOuterCircleDiameter(extracted.body, extracted.viewBox.width);
  const scale = (Math.min(size.width, size.height) * MARK_SCALE) / markDiameter;
  const renderedWidth = extracted.viewBox.width * scale;
  const renderedHeight = extracted.viewBox.height * scale;
  const offsetX = (size.width - renderedWidth) / 2;
  const offsetY = (size.height - renderedHeight) / 2;
  const background = colors.background || "#FFFFFF";
  const auraColor = colors.auraColor || colors.circle3 || "#FFD700";
  const defs = buildDefs(resolvedEffect, auraColor, size);
  const auraRect = resolvedEffect === "aura" ? `\n  <rect width="${size.width}" height="${size.height}" fill="url(#radial-aura)"/>` : "";
  const groupClass = resolvedEffect === "glow" ? "sacred-mark sacred-mark--glow" : "sacred-mark";
  const backgroundRect = transparentBackground ? "" : `\n  <rect width="${size.width}" height="${size.height}" fill="${escapeAttribute(background)}"/>`;
  const mark = buildMarkLayers({
    body: extracted.body,
    effect: resolvedEffect,
    groupClass,
    offsetX,
    offsetY,
    scale,
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.width} ${size.height}" width="${size.width}" height="${size.height}" role="img" aria-label="Sacred-name graphic">
  ${defs}
  ${backgroundRect}${auraRect}
${mark}
</svg>`;
}

export async function renderPngBlob(options) {
  const svg = await renderSacredSvg(options);
  const size = getExportSize(options.sizeId);
  await document.fonts?.ready;
  const image = await loadSvgImage(svg, size);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, size.width, size.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("PNG export failed"));
      }
    }, "image/png");
  });
}

function applyColors(svg, colors) {
  return Object.entries(PLACEHOLDERS).reduce((result, [placeholder, key]) => {
    const value = colors[key] || "#000000";
    return result.replaceAll(`{{${placeholder}}}`, value);
  }, svg);
}

function resolveEffect(effect) {
  return Object.hasOwn(EFFECTS, effect) ? effect : "flat";
}

function buildMarkLayers({ body, effect, groupClass, offsetX, offsetY, scale }) {
  if (effect !== "relief") {
    return buildMarkGroup({
      body,
      className: groupClass,
      offsetX,
      offsetY,
      scale,
    });
  }

  const shadowBody = recolorMark(body, (color) => shadeColor(color, -0.34));
  const highlightBody = recolorMark(body, (color) => shadeColor(color, 0.36));
  const reliefOffset = RELIEF_OFFSET / scale;

  return [
    buildMarkGroup({
      body: shadowBody,
      className: "sacred-mark sacred-mark--relief-shadow",
      offsetX,
      offsetY,
      scale,
      innerOffsetX: reliefOffset,
      innerOffsetY: reliefOffset,
      opacity: RELIEF_SHADOW_OPACITY,
    }),
    buildMarkGroup({
      body: highlightBody,
      className: "sacred-mark sacred-mark--relief-highlight",
      offsetX,
      offsetY,
      scale,
      innerOffsetX: -reliefOffset * 0.55,
      innerOffsetY: -reliefOffset * 0.55,
      opacity: RELIEF_HIGHLIGHT_OPACITY,
    }),
    buildMarkGroup({
      body,
      className: "sacred-mark sacred-mark--relief-main",
      offsetX,
      offsetY,
      scale,
    }),
  ].join("\n");
}

function buildMarkGroup({
  body,
  className,
  offsetX,
  offsetY,
  scale,
  innerOffsetX = 0,
  innerOffsetY = 0,
  opacity,
}) {
  const opacityAttribute = opacity === undefined ? "" : ` opacity="${formatNumber(opacity)}"`;
  const innerTransform = innerOffsetX || innerOffsetY
    ? ` transform="translate(${formatNumber(innerOffsetX)} ${formatNumber(innerOffsetY)})"`
    : "";

  return `  <g class="${className}" transform="translate(${formatNumber(offsetX)} ${formatNumber(offsetY)}) scale(${formatNumber(scale)})"${opacityAttribute}>
    <g${innerTransform}>
${indent(body, 6)}
    </g>
  </g>`;
}

function recolorMark(body, transformColor) {
  return body.replace(/fill="(#[0-9a-fA-F]{3,8})"/g, (_, color) => `fill="${transformColor(color)}"`);
}

function extractSvgBody(svg) {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBoxValues = viewBoxMatch ? viewBoxMatch[1].split(/\s+/).map(Number) : [0, 0, 1000, 1000];
  const bodyMatch = svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/i);
  const body = bodyMatch ? bodyMatch[1].trim() : svg.trim();

  return {
    body: removeTemplateBackground(body),
    viewBox: {
      x: viewBoxValues[0],
      y: viewBoxValues[1],
      width: viewBoxValues[2],
      height: viewBoxValues[3],
    },
  };
}

function removeTemplateBackground(body) {
  return body.replace(/\s*<rect\s+width="1000"\s+height="1000"\s+fill="[^"]+"\s*\/>\s*/i, "\n").trim();
}

function getOuterCircleDiameter(body, fallbackWidth) {
  const radii = [...body.matchAll(/<circle\b[^>]*\br="([^"]+)"/gi)]
    .map((match) => Number(match[1]))
    .filter((radius) => Number.isFinite(radius));
  const outerRadius = Math.max(...radii);

  return Number.isFinite(outerRadius) ? outerRadius * 2 : fallbackWidth;
}

function buildDefs(effect, auraColor, size) {
  if (effect === "flat") {
    return "";
  }

  if (effect === "aura") {
    return `<defs>
    <radialGradient id="radial-aura" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${escapeAttribute(auraColor)}" stop-opacity="0.32"/>
      <stop offset="46%" stop-color="${escapeAttribute(auraColor)}" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="${escapeAttribute(auraColor)}" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
  }

  if (effect === "glow") {
    return `<defs>
    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="0" stdDeviation="${Math.round(Math.min(size.width, size.height) * 0.018)}" flood-color="${escapeAttribute(auraColor)}" flood-opacity="0.45"/>
    </filter>
    <style>.sacred-mark--glow{filter:url(#soft-glow);}</style>
  </defs>`;
  }

  return "";
}

function loadSvgImage(svg, size) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image(size.width, size.height);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load generated SVG"));
    };
    image.src = url;
  });
}

function indent(text, spaces) {
  const padding = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n");
}

function formatNumber(value) {
  return Number(value.toFixed(4)).toString();
}

function shadeColor(color, amount) {
  const hex = normalizeHex(color);
  const channels = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
  const shaded = channels.map((channel) => {
    const target = amount >= 0 ? 255 : 0;
    return Math.round(channel + (target - channel) * Math.abs(amount));
  });

  return `#${shaded.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function normalizeHex(color) {
  const value = color.replace("#", "");

  if (value.length === 3) {
    return [...value].map((character) => `${character}${character}`).join("");
  }

  return value.slice(0, 6).padEnd(6, "0");
}

function escapeAttribute(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}
