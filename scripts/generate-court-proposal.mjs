import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const repoRoot = process.cwd();
const inputPath = path.join(repoRoot, "court-of-claude", "proposal.md");
const outputPath = path.join(repoRoot, "court-of-claude", "proposal.pdf");

function sanitizeForWinAnsi(text) {
  // Standard PDF fonts (WinAnsi) can't encode many Unicode characters.
  // Replace common punctuation/symbols with ASCII equivalents.
  const replaced = text
    .replace(/\u2192/g, "->") // →
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-") // hyphens/dash/minus
    .replace(/[\u2018\u2019\u2032]/g, "'") // quotes/apostrophes
    .replace(/[\u201C\u201D\u2033]/g, '"') // double quotes
    .replace(/\u2026/g, "...") // ellipsis
    .replace(/\u00A0/g, " ") // nbsp
    .replace(/\u00B7/g, "*"); // middle dot

  // Strip remaining non-ASCII characters to avoid encode errors.
  // (Keeps newlines intact.)
  return replaced.replace(/[\u0080-\uFFFF]/g, "");
}

function wrapText(text, maxWidth, font, fontSize) {
  const lines = [];
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(test, fontSize);
      if (width <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }

    if (current) lines.push(current);
  }

  return lines;
}

const md = fs.readFileSync(inputPath, "utf8");

// Render markdown as plain text (simple + predictable for the court).
// Keep headings readable.
const plain = sanitizeForWinAnsi(
  md
  .replace(/^\s*#+\s*/gm, "")
  .replace(/^\s*>\s?/gm, "")
  .replace(/\*\*(.*?)\*\*/g, "$1")
  .replace(/`([^`]+)`/g, "$1")
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
  .trimEnd()
);

const pdfDoc = await PDFDocument.create();
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

const pageSize = { width: 612, height: 792 }; // US Letter
const margin = { top: 54, right: 54, bottom: 54, left: 54 };
const fontSize = 11;
const lineHeight = 15;

const maxWidth = pageSize.width - margin.left - margin.right;
const lines = wrapText(plain, maxWidth, font, fontSize);

let page = pdfDoc.addPage([pageSize.width, pageSize.height]);
let y = pageSize.height - margin.top;

// Title line
page.drawText("Court of Claude — Proposal", {
  x: margin.left,
  y,
  size: 16,
  font: fontBold,
  color: rgb(0, 0, 0),
});

y -= 28;

for (const line of lines) {
  if (y <= margin.bottom) {
    page = pdfDoc.addPage([pageSize.width, pageSize.height]);
    y = pageSize.height - margin.top;
  }

  if (line === "") {
    y -= lineHeight;
    continue;
  }

  page.drawText(line, {
    x: margin.left,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  y -= lineHeight;
}

const pdfBytes = await pdfDoc.save();
fs.writeFileSync(outputPath, pdfBytes);

console.log(`Wrote ${outputPath}`);
