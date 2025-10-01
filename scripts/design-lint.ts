import "./check-node-version.js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import ts from "typescript";

type LintContext = "class" | "style" | "style-object" | "utility" | "unknown";

interface LintSegment {
  text: string;
  node: ts.Node;
  context: LintContext;
}

interface Violation {
  file: string;
  line: number;
  column: number;
  message: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const TOKEN_SOURCE_FILES = [
  path.join(rootDir, "tokens/tokens.css"),
  path.join(rootDir, "src/app/themes.css"),
  path.join(rootDir, "src/app/globals.css"),
];

const TOKEN_MANIFEST_PATH = path.join(rootDir, "tokens/tokens.json");

const CLASS_UTILITY_IDENTIFIERS = new Set(["cn", "clsx"]);
const IGNORED_TOKEN_PREFIXES = ["tw-", "radix-", "sb-", "swiper-", "geist-"];

const HEX_COLOR_PATTERN = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi;
const COLOR_FUNCTION_PATTERN = /\b(?:rgb|rgba|hsl|hsla)\((?!\s*var\()/gi;
const PIXEL_PATTERN = /\b\d+(?:\.\d+)?px\b/gi;
const VAR_PATTERN = /var\(--([a-z0-9-]+)\s*(?:,([^)]*))?\)/gi;
const BRACKET_DEFINITION_PATTERN = /\[--([a-z0-9-]+)\s*:[^\]]+\]/gi;
const BRACKET_USAGE_PATTERN = /\[\s*(--[a-z0-9-]+)\s*\]/gi;

const shouldIgnoreToken = (token: string): boolean =>
  IGNORED_TOKEN_PREFIXES.some((prefix) => token.startsWith(prefix));

const toManifestKey = (token: string): string =>
  token
    .trim()
    .toLowerCase()
    .replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase());

const loadManifestTokens = async (): Promise<Set<string>> => {
  try {
    const raw = await fs.readFile(TOKEN_MANIFEST_PATH, "utf8");
    const manifest = JSON.parse(raw) as Record<string, unknown>;
    return new Set(Object.keys(manifest).map((key) => key.toLowerCase()));
  } catch (error) {
    return new Set();
  }
};

async function loadTokenVocabulary(): Promise<Set<string>> {
  const tokens = await loadManifestTokens();
  const cssFiles = new Set<string>(TOKEN_SOURCE_FILES);
  const discovered = await fg("src/**/*.css", {
    cwd: rootDir,
    absolute: true,
  });
  for (const filePath of discovered) {
    cssFiles.add(filePath);
  }

  for (const filePath of cssFiles) {
    let css: string;
    try {
      css = await fs.readFile(filePath, "utf8");
    } catch (error) {
      continue;
    }
    const tokenPattern = /--([a-z0-9-]+)\s*:/gi;
    let match: RegExpExecArray | null;
    while ((match = tokenPattern.exec(css))) {
      const raw = match[1].toLowerCase();
      if (shouldIgnoreToken(raw)) {
        continue;
      }
      tokens.add(toManifestKey(raw).toLowerCase());
    }
  }

  const styleSources = await fg("src/**/*.{ts,tsx}", {
    cwd: rootDir,
    absolute: true,
  });
  const definitionPattern = /--([a-z0-9-]+)\s*:/gi;
  for (const filePath of styleSources) {
    let contents: string;
    try {
      contents = await fs.readFile(filePath, "utf8");
    } catch (error) {
      continue;
    }
    let match: RegExpExecArray | null;
    while ((match = definitionPattern.exec(contents))) {
      const raw = match[1].toLowerCase();
      if (shouldIgnoreToken(raw)) {
        continue;
      }
      tokens.add(toManifestKey(raw).toLowerCase());
    }
  }
  return tokens;
}

const getScriptKind = (filePath: string): ts.ScriptKind => {
  if (filePath.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (filePath.endsWith(".ts")) return ts.ScriptKind.TS;
  if (filePath.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (filePath.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TSX;
};

const createViolation = (
  sourceFile: ts.SourceFile,
  node: ts.Node,
  message: string,
): Violation => {
  const position = node.getStart(sourceFile);
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);
  const relative = path.relative(rootDir, sourceFile.fileName).replace(/\\/g, "/");
  return {
    file: relative,
    line: line + 1,
    column: character + 1,
    message,
  };
};

const addLocalCssVar = (
  node: ts.Node,
  sourceFile: ts.SourceFile,
  localTokens: Set<string>,
): void => {
  if (!ts.isPropertyAssignment(node)) {
    return;
  }
  const { name } = node;
  if (ts.isStringLiteralLike(name) && name.text.startsWith("--")) {
    const raw = name.text.slice(2).toLowerCase();
    if (shouldIgnoreToken(raw)) {
      return;
    }
    localTokens.add(toManifestKey(raw).toLowerCase());
  }
};

const collectSegmentsFromTemplate = (
  template: ts.TemplateLiteral,
  context: LintContext,
): LintSegment[] => {
  if (ts.isNoSubstitutionTemplateLiteral(template)) {
    return template.text ? [{ text: template.text, node: template, context }] : [];
  }

  const segments: LintSegment[] = [];
  if (template.head.text) {
    segments.push({ text: template.head.text, node: template.head, context });
  }
  for (const span of template.templateSpans) {
    if (span.literal.text) {
      segments.push({ text: span.literal.text, node: span.literal, context });
    }
  }
  return segments;
};

const collectSegmentsFromExpression = (
  expression: ts.Expression,
  context: LintContext,
): LintSegment[] => {
  if (ts.isParenthesizedExpression(expression)) {
    return collectSegmentsFromExpression(expression.expression, context);
  }

  if (ts.isStringLiteralLike(expression)) {
    return expression.text
      ? [{ text: expression.text, node: expression, context }]
      : [];
  }

  if (ts.isTemplateExpression(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return collectSegmentsFromTemplate(expression, context);
  }

  if (ts.isConditionalExpression(expression)) {
    return [
      ...collectSegmentsFromExpression(expression.whenTrue, context),
      ...collectSegmentsFromExpression(expression.whenFalse, context),
    ];
  }

  if (
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    return [
      ...collectSegmentsFromExpression(expression.left, context),
      ...collectSegmentsFromExpression(expression.right, context),
    ];
  }

  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements.flatMap((element) => {
      if (ts.isSpreadElement(element)) {
        return [];
      }
      return collectSegmentsFromExpression(element as ts.Expression, context);
    });
  }

  if (ts.isCallExpression(expression)) {
    if (
      ts.isIdentifier(expression.expression) &&
      CLASS_UTILITY_IDENTIFIERS.has(expression.expression.text)
    ) {
      return expression.arguments.flatMap((argument) =>
        collectSegmentsFromExpression(argument, context === "unknown" ? "utility" : context),
      );
    }
    return [];
  }

  if (ts.isObjectLiteralExpression(expression)) {
    const segments: LintSegment[] = [];
    for (const prop of expression.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = prop.name;
        if (ts.isStringLiteralLike(key) && key.text) {
          segments.push({ text: key.text, node: key, context });
        }
        if (ts.isExpression(prop.initializer)) {
          segments.push(
            ...collectSegmentsFromExpression(
              prop.initializer,
              context === "unknown" ? "utility" : context,
            ),
          );
        }
      }
    }
    return segments;
  }

  return [];
};

const analyzeSegments = (
  segments: readonly LintSegment[],
  sourceFile: ts.SourceFile,
  globalTokens: ReadonlySet<string>,
  localTokens: Set<string>,
  violations: Violation[],
): void => {
  for (const segment of segments) {
    const { text, node, context } = segment;
    if (!text.trim()) {
      continue;
    }

    const checkToken = (token: string, hasFallback: boolean): void => {
      const rawToken = token.trim();
      if (!rawToken) {
        return;
      }
      const lowerToken = rawToken.toLowerCase();
      if (shouldIgnoreToken(lowerToken) || hasFallback) {
        return;
      }
      const manifestKey = toManifestKey(lowerToken).toLowerCase();
      if (globalTokens.has(manifestKey) || localTokens.has(manifestKey)) {
        return;
      }
      const message = `Unknown design token "--${rawToken}" referenced in ${context} context.`;
      violations.push(createViolation(sourceFile, node, message));
    };

    BRACKET_DEFINITION_PATTERN.lastIndex = 0;
    let definitionMatch: RegExpExecArray | null;
    while ((definitionMatch = BRACKET_DEFINITION_PATTERN.exec(text))) {
      localTokens.add(definitionMatch[1].toLowerCase());
    }

    VAR_PATTERN.lastIndex = 0;
    let varMatch: RegExpExecArray | null;
    while ((varMatch = VAR_PATTERN.exec(text))) {
      const tokenName = varMatch[1];
      const fallback = (varMatch[2] ?? "").trim();
      checkToken(tokenName, fallback.length > 0);
    }

    BRACKET_USAGE_PATTERN.lastIndex = 0;
    let bracketMatch: RegExpExecArray | null;
    while ((bracketMatch = BRACKET_USAGE_PATTERN.exec(text))) {
      const tokenName = bracketMatch[1]?.slice(2) ?? "";
      if (tokenName) {
        checkToken(tokenName, false);
      }
    }

    HEX_COLOR_PATTERN.lastIndex = 0;
    let hexMatch: RegExpExecArray | null;
    while ((hexMatch = HEX_COLOR_PATTERN.exec(text))) {
      const value = hexMatch[0];
      violations.push(
        createViolation(
          sourceFile,
          node,
          `Raw color literal "${value}" found in ${context} context. Use semantic tokens instead.`,
        ),
      );
    }

    COLOR_FUNCTION_PATTERN.lastIndex = 0;
    let colorMatch: RegExpExecArray | null;
    while ((colorMatch = COLOR_FUNCTION_PATTERN.exec(text))) {
      const fnName = colorMatch[0].split("(")[0];
      violations.push(
        createViolation(
          sourceFile,
          node,
          `${fnName}() literal detected in ${context} context. Wrap values with design tokens.`,
        ),
      );
    }

    if (context !== "unknown") {
      PIXEL_PATTERN.lastIndex = 0;
      let pxMatch: RegExpExecArray | null;
      while ((pxMatch = PIXEL_PATTERN.exec(text))) {
        const value = pxMatch[0];
        violations.push(
          createViolation(
            sourceFile,
            node,
            `Pixel value "${value}" used in ${context} context. Prefer spacing or sizing tokens.`,
          ),
        );
      }
    }
  }
};

const shouldCheckStyleObject = (declaration: ts.VariableDeclaration): boolean => {
  const initializer = declaration.initializer;
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    return false;
  }
  if (declaration.type) {
    const typeText = declaration.type.getText();
    if (/(CSSProperties|Style)\b/.test(typeText)) {
      return true;
    }
  }
  if (ts.isIdentifier(declaration.name) && /Style$/.test(declaration.name.text)) {
    return true;
  }
  return false;
};

async function lintFile(
  filePath: string,
  globalTokens: Set<string>,
  violations: Violation[],
): Promise<void> {
  const sourceText = await fs.readFile(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  );

  const localTokens = new Set<string>();

  const collectLocalTokens = (node: ts.Node): void => {
    addLocalCssVar(node, sourceFile, localTokens);
    if (ts.isStringLiteralLike(node) && node.text) {
      BRACKET_DEFINITION_PATTERN.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = BRACKET_DEFINITION_PATTERN.exec(node.text))) {
        const raw = match[1].toLowerCase();
        if (shouldIgnoreToken(raw)) {
          continue;
        }
        localTokens.add(toManifestKey(raw).toLowerCase());
      }
    } else if (ts.isTemplateExpression(node)) {
      if (node.head.text) {
        BRACKET_DEFINITION_PATTERN.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = BRACKET_DEFINITION_PATTERN.exec(node.head.text))) {
          const raw = match[1].toLowerCase();
          if (shouldIgnoreToken(raw)) {
            continue;
          }
          localTokens.add(toManifestKey(raw).toLowerCase());
        }
      }
      for (const span of node.templateSpans) {
        if (span.literal.text) {
          BRACKET_DEFINITION_PATTERN.lastIndex = 0;
          let match: RegExpExecArray | null;
          while ((match = BRACKET_DEFINITION_PATTERN.exec(span.literal.text))) {
            const raw = match[1].toLowerCase();
            if (shouldIgnoreToken(raw)) {
              continue;
            }
            localTokens.add(toManifestKey(raw).toLowerCase());
          }
        }
      }
    }
    ts.forEachChild(node, collectLocalTokens);
  };
  collectLocalTokens(sourceFile);

  const visit = (node: ts.Node): void => {
    if (ts.isJsxAttribute(node) && node.initializer) {
      const name = node.name.getText();
      if (name === "className" || name === "class") {
        const initializer = node.initializer;
        if (ts.isStringLiteralLike(initializer)) {
          analyzeSegments(
            [{ text: initializer.text, node: initializer, context: "class" }],
            sourceFile,
            globalTokens,
            localTokens,
            violations,
          );
        } else if (ts.isJsxExpression(initializer) && initializer.expression) {
          const segments = collectSegmentsFromExpression(initializer.expression, "class");
          analyzeSegments(segments, sourceFile, globalTokens, localTokens, violations);
        }
      } else if (name === "style" && ts.isJsxExpression(node.initializer)) {
        const expression = node.initializer.expression;
        if (expression && ts.isObjectLiteralExpression(expression)) {
          const segments: LintSegment[] = [];
          for (const prop of expression.properties) {
            if (ts.isPropertyAssignment(prop) && ts.isExpression(prop.initializer)) {
              segments.push(
                ...collectSegmentsFromExpression(prop.initializer, "style"),
              );
            }
          }
          analyzeSegments(segments, sourceFile, globalTokens, localTokens, violations);
        } else if (expression) {
          const segments = collectSegmentsFromExpression(expression, "style");
          analyzeSegments(segments, sourceFile, globalTokens, localTokens, violations);
        }
      }
    } else if (ts.isVariableDeclaration(node) && shouldCheckStyleObject(node)) {
      const initializer = node.initializer;
      if (initializer && ts.isObjectLiteralExpression(initializer)) {
        const segments: LintSegment[] = [];
        for (const prop of initializer.properties) {
          if (ts.isPropertyAssignment(prop) && ts.isExpression(prop.initializer)) {
            segments.push(
              ...collectSegmentsFromExpression(prop.initializer, "style-object"),
            );
          }
        }
        analyzeSegments(segments, sourceFile, globalTokens, localTokens, violations);
      }
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      CLASS_UTILITY_IDENTIFIERS.has(node.expression.text) &&
      !ts.isJsxAttribute(node.parent)
    ) {
      const segments = collectSegmentsFromExpression(node, "utility");
      analyzeSegments(segments, sourceFile, globalTokens, localTokens, violations);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

async function main(): Promise<void> {
  const files = await fg(["src/**/*.{ts,tsx}"], {
    cwd: rootDir,
    absolute: true,
    ignore: [
      "**/*.d.ts",
      "**/generated-*.ts",
      "**/__generated__/**",
      "**/generated/**",
    ],
  });

  const globalTokens = await loadTokenVocabulary();
  const violations: Violation[] = [];

  for (const file of files) {
    await lintFile(file, globalTokens, violations);
  }

  if (violations.length > 0) {
    violations.sort((a, b) => {
      if (a.file !== b.file) return a.file.localeCompare(b.file);
      if (a.line !== b.line) return a.line - b.line;
      return a.column - b.column;
    });

    const grouped = violations.reduce<Record<string, Violation[]>>((acc, violation) => {
      acc[violation.file] ??= [];
      acc[violation.file].push(violation);
      return acc;
    }, {});

    console.error("Design lint found violations:\n");
    for (const [file, issues] of Object.entries(grouped)) {
      console.error(file);
      for (const issue of issues) {
        console.error(
          `  ${issue.line}:${issue.column} ${issue.message}`,
        );
      }
      console.error("");
    }
    process.exitCode = 1;
    return;
  }

  console.log("Design lint passed with no violations.");
}

await main();
