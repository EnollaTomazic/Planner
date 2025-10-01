const COLOR_PATTERN = /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|\b(?:rgb|rgba|hsl|hsla)\((?!\s*var\()/gi;
const SPACING_PATTERN = /\b\d+(?:\.\d+)?px\b/gi;

const DEFAULT_ALLOWED_VALUES = new Set([
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "auto",
  "none",
]);

const COLOR_PROPERTIES = new Set([
  "background",
  "backgroundcolor",
  "bordercolor",
  "borderleftcolor",
  "borderrightcolor",
  "bordertopcolor",
  "borderbottomcolor",
  "caretcolor",
  "color",
  "fill",
  "outlinecolor",
  "shadowcolor",
  "strokecolor",
  "stroke",
  "textdecorationcolor",
]);

const SPACING_PROPERTIES = new Set([
  "bottom",
  "column-gap",
  "columngap",
  "gap",
  "gridcolumngap",
  "gridrowgap",
  "height",
  "inset",
  "insetblock",
  "insetinline",
  "insetinlinestart",
  "insetinlineend",
  "left",
  "margin",
  "marginbottom",
  "marginleft",
  "marginright",
  "margintop",
  "maxheight",
  "maxwidth",
  "minheight",
  "minwidth",
  "padding",
  "paddingbottom",
  "paddingleft",
  "paddingright",
  "paddingtop",
  "right",
  "row-gap",
  "rowgap",
  "top",
  "width",
]);

const RADIUS_PROPERTIES = new Set([
  "borderradius",
  "bordertopleftradius",
  "bordertoprightradius",
  "borderbottomleftradius",
  "borderbottomrightradius",
]);

const BOX_SHADOW_PROPERTIES = new Set(["boxshadow", "textshadow"]);

const normalizeProperty = (property) => property.replace(/[^a-z0-9]/gi, "").toLowerCase();

const isJSXAttribute = (node) => !!node && node.type === "JSXAttribute";

const isJSXExpressionContainer = (node) =>
  !!node && node.type === "JSXExpressionContainer";

const getJSXAttributeName = (attribute) => {
  const { name } = attribute;
  if (!name) {
    return null;
  }
  if (name.type === "JSXIdentifier") {
    return name.name;
  }
  if (name.type === "JSXNamespacedName") {
    return `${name.namespace.name}:${name.name.name}`;
  }
  return null;
};

const getPropertyName = (property) => {
  if (!property || property.computed) {
    return null;
  }
  const { key } = property;
  if (!key) {
    return null;
  }
  if (key.type === "Identifier") {
    return key.name;
  }
  if (key.type === "Literal" && typeof key.value === "string") {
    return key.value;
  }
  return null;
};

const createRegExpFromOption = (entry) => {
  if (typeof entry === "string") {
    return new RegExp(entry, "i");
  }
  if (entry && typeof entry.pattern === "string") {
    return new RegExp(entry.pattern, "i");
  }
  return null;
};

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw color, spacing, or radius literals outside of the approved design tokens and utilities.",
    },
    defaultOptions: [{}],
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: {
              anyOf: [
                { type: "string" },
                {
                  type: "object",
                  properties: {
                    pattern: { type: "string" },
                  },
                  required: ["pattern"],
                  additionalProperties: false,
                },
              ],
            },
          },
          allowNumeric: {
            type: "array",
            items: { type: "number" },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      color: "Avoid raw color value \"{{value}}\". Use design tokens or utilities instead.",
      colorWithProperty:
        "Avoid raw color value \"{{value}}\" for \"{{property}}\". Use design tokens or utilities instead.",
      spacing: "Avoid raw spacing value \"{{value}}\". Use spacing tokens or utilities instead.",
      spacingWithProperty:
        "Avoid raw spacing value \"{{value}}\" for \"{{property}}\". Use spacing tokens or utilities instead.",
      radiusWithProperty:
        "Avoid raw radius value \"{{value}}\" for \"{{property}}\". Use radius tokens or utilities instead.",
      numericSpacing:
        "Avoid raw spacing value {{value}} for \"{{property}}\". Use spacing tokens or utilities instead.",
      numericRadius:
        "Avoid raw radius value {{value}} for \"{{property}}\". Use radius tokens or utilities instead.",
    },
  },
  create(context) {
    const [options = {}] = context.options;
    const allowedValues = new Set(DEFAULT_ALLOWED_VALUES);
    const allowedPatterns = [];
    const allowedNumeric = new Set([0]);

    if (Array.isArray(options.allow)) {
      for (const entry of options.allow) {
        if (typeof entry === "string") {
          allowedValues.add(entry.toLowerCase());
          continue;
        }
        const regex = createRegExpFromOption(entry);
        if (regex) {
          allowedPatterns.push(regex);
        }
      }
    }

    if (Array.isArray(options.allowNumeric)) {
      for (const numeric of options.allowNumeric) {
        if (Number.isFinite(numeric)) {
          allowedNumeric.add(numeric);
        }
      }
    }

    const isAllowedString = (value) => {
      const normalized = value.trim().toLowerCase();
      if (allowedValues.has(normalized)) {
        return true;
      }
      return allowedPatterns.some((pattern) => pattern.test(value));
    };

    const isWithinCssVariable = (text, index) => {
      const opening = text.lastIndexOf("var(", index);
      if (opening === -1) {
        return false;
      }
      const closing = text.indexOf(")", opening);
      return closing !== -1 && closing >= index;
    };

    const reportMatch = (node, rawValue, kind, property) => {
      if (!rawValue) {
        return;
      }
      const trimmed = rawValue.trim();
      if (!trimmed || isAllowedString(trimmed)) {
        return;
      }

      const messageId = (() => {
        if (property) {
          if (kind === "color") {
            return "colorWithProperty";
          }
          if (kind === "radius") {
            return "radiusWithProperty";
          }
          return "spacingWithProperty";
        }
        return kind === "color" ? "color" : "spacing";
      })();

      const data = property
        ? { value: trimmed, property }
        : { value: trimmed };

      context.report({
        node,
        messageId,
        data,
      });
    };

    const checkText = (value, node, property) => {
      COLOR_PATTERN.lastIndex = 0;
      let match;
      while ((match = COLOR_PATTERN.exec(value))) {
        const [raw] = match;
        if (raw && isWithinCssVariable(value, match.index)) {
          continue;
        }
        reportMatch(node, raw, "color", property);
      }

      SPACING_PATTERN.lastIndex = 0;
      while ((match = SPACING_PATTERN.exec(value))) {
        const [raw] = match;
        if (!raw || /^0+(?:\.0+)?px$/i.test(raw)) {
          continue;
        }
        const prefix = value.slice(0, match.index);
        if (/tracking-\[\s*[-+]?$/i.test(prefix)) {
          continue;
        }
        if (/(?:max|min)-width\s*:/i.test(value) || value.includes("minmax(") || /[≤≥]/u.test(value)) {
          continue;
        }
        const kind =
          property && RADIUS_PROPERTIES.has(normalizeProperty(property))
            ? "radius"
            : "spacing";
        reportMatch(node, raw, kind, property);
      }
    };

    const checkLiteral = (literal, property) => {
      if (typeof literal.value === "string") {
        checkText(literal.value, literal, property);
        return;
      }
      if (typeof literal.value === "number" && property) {
        if (!allowedNumeric.has(literal.value)) {
          const propertyName = property;
          const normalized = normalizeProperty(propertyName);
          const messageId = RADIUS_PROPERTIES.has(normalized)
            ? "numericRadius"
            : "numericSpacing";
          context.report({
            node: literal,
            messageId,
            data: {
              value: literal.raw ?? String(literal.value),
              property: propertyName,
            },
          });
        }
      }
    };

    const checkTemplateLiteral = (literal, property) => {
      for (const quasi of literal.quasis) {
        const cooked = quasi.value.cooked ?? quasi.value.raw ?? "";
        if (cooked) {
          checkText(cooked, quasi, property);
        }
      }
    };

    const checkStyleObject = (objectExpression) => {
      for (const property of objectExpression.properties) {
        if (!property || property.type !== "Property") {
          continue;
        }
        const propertyName = getPropertyName(property);
        if (!propertyName) {
          continue;
        }
        const normalized = normalizeProperty(propertyName);
        const tracksColor = COLOR_PROPERTIES.has(normalized);
        const tracksSpacing =
          SPACING_PROPERTIES.has(normalized) || BOX_SHADOW_PROPERTIES.has(normalized);
        const tracksRadius = RADIUS_PROPERTIES.has(normalized);

        if (!tracksColor && !tracksSpacing && !tracksRadius) {
          continue;
        }

        const valueNode = property.value;
        if (!valueNode) {
          continue;
        }
        if (valueNode.type === "Literal") {
          checkLiteral(valueNode, propertyName);
          continue;
        }

        if (valueNode.type === "TemplateLiteral") {
          checkTemplateLiteral(valueNode, propertyName);
          continue;
        }

        if (valueNode.type === "ArrayExpression") {
          for (const element of valueNode.elements) {
            if (!element) continue;
            if (element.type === "Literal") {
              checkLiteral(element, propertyName);
            } else if (element.type === "TemplateLiteral") {
              checkTemplateLiteral(element, propertyName);
            }
          }
        }
      }
    };

    const visitLiteral = (node) => {
      if (typeof node.value === "string") {
        const parent = node.parent;
        if (isJSXAttribute(parent) && getJSXAttributeName(parent) === "sizes") {
          return;
        }
        if (
          parent &&
          parent.type === "VariableDeclarator" &&
          parent.id &&
          parent.id.type === "Identifier" &&
          parent.id.name.toLowerCase().includes("sizes") &&
          node.value.includes("max-width")
        ) {
          return;
        }
        checkText(node.value, node);
      }
    };

    return {
      Literal(node) {
        visitLiteral(node);
      },
      TemplateLiteral(node) {
        checkTemplateLiteral(node);
      },
      JSXAttribute(node) {
        if (!isJSXAttribute(node)) {
          return;
        }
        if (getJSXAttributeName(node) !== "style") {
          return;
        }
        const { value } = node;
        if (!value || !isJSXExpressionContainer(value)) {
          return;
        }
        const expression = value.expression;
        if (!expression || expression.type !== "ObjectExpression") {
          return;
        }
        checkStyleObject(expression);
      },
    };
  },
};

export default rule;
