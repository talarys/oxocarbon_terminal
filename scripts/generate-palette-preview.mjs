#!/usr/bin/env node
// Regenerates assets/palette-preview.svg from palettes/*.yml.
// No dependencies: the palette files are a fixed, flat Base16 YAML shape.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readPalette(file) {
  const text = readFileSync(join(root, "palettes", file), "utf8");
  const palette = {};
  for (const line of text.split("\n")) {
    const match = line.match(/^(scheme|variant):\s*"([^"]+)"/);
    if (match) palette[match[1]] = match[2];
    const color = line.match(/^(base0[0-9A-F]):\s*"([0-9a-fA-F]{6})"/);
    if (color) palette[color[1]] = color[2].toLowerCase();
  }
  return palette;
}

function luminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/../g)
    .map((pair) => parseInt(pair, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

function readableOn(background, dark, light) {
  return contrast(background, dark) >= contrast(background, light) ? dark : light;
}

const palettes = [
  readPalette("oxocarbon-dark.yml"),
  readPalette("oxocarbon-light.yml"),
];

const WIDTH = 1120;
const PANEL_X = 24;
const PANEL_W = WIDTH - PANEL_X * 2;
const PANEL_H = 232;
const PANEL_GAP = 20;
const TOP = 24;
const SWATCH_W = 117;
const SWATCH_H = 62;
const SWATCH_GAP = 12;
const GRID_X = PANEL_X + 26;
const GRID_Y = 72;

const parts = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${TOP * 2 + PANEL_H * 2 + PANEL_GAP}" viewBox="0 0 ${WIDTH} ${TOP * 2 + PANEL_H * 2 + PANEL_GAP}" role="img" aria-labelledby="title desc">`,
  `<title id="title">Oxocarbon palette preview</title>`,
  `<desc id="desc">Base16 color swatches for the Oxocarbon dark and light palettes</desc>`,
  `<style>
    text { font-family: "SFMono-Regular", "Cascadia Code", Consolas, "Liberation Mono", monospace; }
  </style>`,
];

palettes.forEach((palette, index) => {
  const dark = palette.variant === "dark";
  const panelY = TOP + index * (PANEL_H + PANEL_GAP);
  const panelFill = dark ? "#161616" : "#ffffff";
  const panelStroke = dark ? "#393939" : "#d0d0d0";
  const headingFill = dark ? "#f2f2f2" : "#161616";
  const mutedFill = dark ? "#90a4ae" : "#525252";
  const swatchStroke = dark ? "#ffffff22" : "#00000022";
  const textDark = dark ? "#161616" : "#161616";
  const textLight = "#ffffff";

  parts.push(
    `<rect x="${PANEL_X}" y="${panelY}" width="${PANEL_W}" height="${PANEL_H}" rx="10" fill="${panelFill}" stroke="${panelStroke}"/>`,
    `<text x="${PANEL_X + 26}" y="${panelY + 44}" font-size="22" font-weight="700" fill="${headingFill}">${palette.scheme}</text>`,
    `<text x="${PANEL_X + PANEL_W - 26}" y="${panelY + 44}" font-size="13" text-anchor="end" fill="${mutedFill}">Base16 · 16 colors</text>`,
  );

  for (let slot = 0; slot < 16; slot += 1) {
    const name = `base0${slot.toString(16).toUpperCase()}`;
    const fill = palette[name];
    const column = slot % 8;
    const row = Math.floor(slot / 8);
    const x = GRID_X + column * (SWATCH_W + SWATCH_GAP);
    const y =
      panelY + GRID_Y + row * (SWATCH_H + SWATCH_GAP);
    const ink = readableOn(fill, textDark, textLight);

    parts.push(
      `<g>`,
      `<rect x="${x}" y="${y}" width="${SWATCH_W}" height="${SWATCH_H}" rx="6" fill="#${fill}" stroke="${swatchStroke}"/>`,
      `<text x="${x + 10}" y="${y + 25}" font-size="13" font-weight="700" fill="${ink}">${name}</text>`,
      `<text x="${x + 10}" y="${y + 47}" font-size="13" fill="${ink}" opacity="0.85">#${fill}</text>`,
      `</g>`,
    );
  }
});

parts.push("</svg>");

const target = join(root, "assets", "palette-preview.svg");
writeFileSync(target, `${parts.join("\n")}\n`);
console.log(`wrote ${target}`);
