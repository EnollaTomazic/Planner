import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const readmePath = path.join(process.cwd(), 'README.md');
const readme = fs.readFileSync(readmePath, 'utf8');

function getSection(content: string, header: string): string {
  const marker = `## ${header}`;
  const start = content.indexOf(marker);
  if (start === -1) {
    throw new Error(`Missing section: ${header}`);
  }
  const after = content.slice(start + marker.length);
  const nextIndex = after.indexOf('\n## ');
  return after.slice(0, nextIndex === -1 ? after.length : nextIndex).trim();
}

function getSubsection(content: string, header: string): string {
  const marker = `### ${header}`;
  const start = content.indexOf(marker);
  if (start === -1) {
    throw new Error(`Missing subsection: ${header}`);
  }
  const after = content.slice(start + marker.length);
  const nextIndex = after.search(/\n### |\n## /);
  return after.slice(0, nextIndex === -1 ? after.length : nextIndex).trim();
}

function getDetail(content: string, header: string): string {
  const marker = `#### ${header}`;
  const start = content.indexOf(marker);
  if (start === -1) {
    throw new Error(`Missing detail section: ${header}`);
  }
  const after = content.slice(start + marker.length);
  const nextIndex = after.search(/\n### |\n## |\n#### /);
  return after.slice(0, nextIndex === -1 ? after.length : nextIndex).trim();
}

describe('README design system documentation', () => {
  const designSystemSection = getSection(readme, 'Design System');

  it('documents the Hero component usage', () => {
    const hero = getDetail(designSystemSection, 'Hero');
    expect(hero).toMatch(/Hero/);
    expect(hero).toMatch(/glitch/);
    expect(hero).toMatch(/PageShell/);
  });

  it('documents the Card component usage', () => {
    const card = getDetail(designSystemSection, 'Card');
    expect(card).toMatch(/Card/);
    expect(card).toMatch(/depth/);
    expect(card).toMatch(/glitch/);
  });

  it('documents the PageShell component usage', () => {
    const pageShell = getDetail(designSystemSection, 'PageShell');
    expect(pageShell).toMatch(/page-shell/);
    expect(pageShell).toMatch(/grid/);
  });

  it('documents the Input component usage', () => {
    const input = getDetail(designSystemSection, 'Input');
    expect(input).toMatch(/Input/);
    expect(input).toMatch(/height/);
    expect(input).toMatch(/ringTone/);
  });

  it('explains theme tokens, spacing, and 3D effects', () => {
    const themeTokens = getDetail(designSystemSection, 'Theme tokens');
    const spacing = getDetail(designSystemSection, 'Spacing scale');
    const depth = getDetail(designSystemSection, '3D effects and depth');

    expect(themeTokens).toMatch(/tokens/);
    expect(themeTokens).toMatch(/utilities/);
    expect(spacing).toMatch(/--space/);
    expect(spacing).toMatch(/var\(/);
    expect(depth).toMatch(/shadow/);
    expect(depth).toMatch(/overlay/);
  });
});
