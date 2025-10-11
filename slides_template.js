(function (global) {
  "use strict";

  /**
   * Lightweight slide template helpers for building HTML slides with
   * consistent typography, spacing, and styling across multiple layouts.
   *
   * The helpers return self-contained HTML strings that can be injected into a
   * slide deck generator or static export flow. All layouts share a common
   * baseline defined by DEFAULT_THEME so new slide types inherit the same
   * margins, fonts, and color palette.
   */

  var DEFAULT_THEME = {
    width: 1280,
    height: 720,
    padding: 64,
    gap: 32,
    backgroundColor: "#ffffff",
    accentColor: "#2563eb",
    textColor: "#0f172a",
    mutedTextColor: "#334155",
    fontFamily:
      "'Inter', 'Helvetica Neue', Helvetica, Arial, 'Segoe UI', sans-serif",
    borderRadius: 24,
  };

  function mergeTheme(overrides) {
    var theme = {};
    var keys = Object.keys(DEFAULT_THEME);
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      theme[key] = DEFAULT_THEME[key];
    }
    if (!overrides) {
      return theme;
    }
    var overrideKeys = Object.keys(overrides);
    for (var j = 0; j < overrideKeys.length; j += 1) {
      var overrideKey = overrideKeys[j];
      if (overrides[overrideKey] !== undefined) {
        theme[overrideKey] = overrides[overrideKey];
      }
    }
    return theme;
  }

  function createSlideShell(theme, content, additionalStyles) {
    var styles = [
      "box-sizing:border-box",
      "display:flex",
      "flex-direction:column",
      "justify-content:center",
      "width:" + theme.width + "px",
      "height:" + theme.height + "px",
      "padding:" + theme.padding + "px",
      "gap:" + theme.gap + "px",
      "background:" + theme.backgroundColor,
      "color:" + theme.textColor,
      "font-family:" + theme.fontFamily,
      "border-radius:" + theme.borderRadius + "px",
    ];

    if (additionalStyles && additionalStyles.length) {
      styles = styles.concat(additionalStyles);
    }

    return (
      "<section style=\"" + styles.join(";") + ";\">" +
      content +
      "</section>"
    );
  }

  function createHeadingMarkup(text, level, theme) {
    if (!text) {
      return "";
    }
    var fontSizes = {
      1: 56,
      2: 40,
      3: 28,
    };
    var weight = level === 1 ? 700 : level === 2 ? 600 : 500;
    var margin = level === 1 ? 8 : 4;
    return (
      "<h" +
      level +
      " style=\"margin:0 0 " +
      margin +
      "px 0;font-size:" +
      fontSizes[level] +
      "px;font-weight:" +
      weight +
      ";line-height:1.1;\">" +
      text +
      "</h" +
      level +
      ">"
    );
  }

  function createParagraph(text, theme) {
    if (!text) {
      return "";
    }
    return (
      "<p style=\"margin:0;font-size:24px;line-height:1.6;color:" +
      theme.mutedTextColor +
      ";\">" +
      text +
      "</p>"
    );
  }

  function createList(items, theme) {
    if (!items || !items.length) {
      return "";
    }
    var listItems = items
      .map(function (item) {
        return (
          "<li style=\"margin-bottom:12px;\">" +
          item +
          "</li>"
        );
      })
      .join("");
    return (
      "<ul style=\"margin:0;padding-left:28px;font-size:24px;line-height:1.6;color:" +
      theme.mutedTextColor +
      ";\">" +
      listItems +
      "</ul>"
    );
  }

  function generateTitleSlide(options) {
    var opts = options || {};
    var theme = mergeTheme(opts.theme);
    var pieces = [];
    if (opts.kicker) {
      pieces.push(
        "<span style=\"text-transform:uppercase;letter-spacing:0.14em;font-size:18px;font-weight:600;color:" +
          theme.accentColor +
          ";\">" +
          opts.kicker +
          "</span>"
      );
    }
    pieces.push(createHeadingMarkup(opts.title || "Presentation Title", 1, theme));
    if (opts.subtitle) {
      pieces.push(createParagraph(opts.subtitle, theme));
    }
    if (opts.footer) {
      pieces.push(
        "<footer style=\"margin-top:auto;font-size:20px;color:" +
          theme.mutedTextColor +
          ";\">" +
          opts.footer +
          "</footer>"
      );
    }
    return createSlideShell(theme, pieces.join(""));
  }

  function generateSectionSlide(options) {
    var opts = options || {};
    var theme = mergeTheme(opts.theme);
    var pieces = [];
    pieces.push(createHeadingMarkup(opts.title || "Section", 1, theme));
    if (opts.description) {
      pieces.push(createParagraph(opts.description, theme));
    }
    return createSlideShell(theme, pieces.join(""));
  }

  function generateTwoColumnTextImageSlide(options) {
    var opts = options || {};
    var theme = mergeTheme(opts.theme);
    var alignment = opts.imageAlignment === "left" ? "row" : "row-reverse";
    var columnStyles =
      "flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:" +
      theme.gap +
      "px;";
    var textContent = [
      createHeadingMarkup(opts.title || "", 2, theme),
      createParagraph(opts.body || "", theme),
      createList(opts.bullets || [], theme),
    ]
      .join("");
    var imageMarkup = "";
    if (opts.imageUrl) {
      imageMarkup =
        "<figure style=\"" +
        columnStyles +
        "align-items:" +
        (alignment === "row" ? "flex-start" : "flex-end") +
        ";\"><img src=\"" +
        opts.imageUrl +
        "\" alt=\"" +
        (opts.imageAlt || "Illustration") +
        "\" style=\"max-width:100%;border-radius:" +
        theme.borderRadius / 2 +
        "px;box-shadow:0 25px 45px rgba(15,23,42,0.12);\"/></figure>";
    }
    var content =
      "<div style=\"display:flex;flex:1;gap:" +
      theme.gap +
      "px;flex-direction:" +
      alignment +
      ";align-items:stretch;\">" +
      "<div style=\"" +
      columnStyles +
      "\">" +
      textContent +
      "</div>" +
      imageMarkup +
      "</div>";
    return createSlideShell(theme, content, ["justify-content:flex-start"]);
  }

  function generateQuoteSlide(options) {
    var opts = options || {};
    var theme = mergeTheme(opts.theme);
    var quote = opts.quote || "Inspiring quote goes here.";
    var attribution = opts.attribution || "Attribution";
    var quoteMarkup =
      "<blockquote style=\"margin:0;padding-left:24px;border-left:6px solid " +
      theme.accentColor +
      ";font-size:40px;line-height:1.4;font-weight:600;\">" +
      quote +
      "</blockquote>";
    var attributionMarkup =
      "<cite style=\"margin-top:16px;font-style:normal;font-size:24px;color:" +
      theme.mutedTextColor +
      ";\">" +
      attribution +
      "</cite>";
    return createSlideShell(theme, quoteMarkup + attributionMarkup);
  }

  function generateAgendaSlide(options) {
    var opts = options || {};
    var theme = mergeTheme(opts.theme);
    var title = opts.title || "Agenda";
    var highlightIndex = opts.highlightIndex;
    var items = Array.isArray(opts.items) ? opts.items : [];
    var agendaItems = items
      .map(function (item, index) {
        var isHighlighted = index === highlightIndex;
        var bullet = isHighlighted ? theme.accentColor : theme.mutedTextColor;
        var textColor = isHighlighted ? theme.textColor : theme.mutedTextColor;
        var weight = isHighlighted ? 600 : 400;
        return (
          "<li style=\"display:flex;align-items:center;gap:16px;margin-bottom:12px;\">" +
          "<span style=\"width:10px;height:10px;border-radius:50%;background:" +
          bullet +
          ";display:inline-block;\"></span>" +
          "<span style=\"font-size:24px;color:" +
          textColor +
          ";font-weight:" +
          weight +
          ";\">" +
          item +
          "</span>" +
          "</li>"
        );
      })
      .join("");

    var content =
      createHeadingMarkup(title, 2, theme) +
      "<ul style=\"margin:0;padding:0;list-style:none;\">" +
      agendaItems +
      "</ul>";

    return createSlideShell(theme, content, ["justify-content:flex-start"]);
  }

  var api = {
    generateTitleSlide: generateTitleSlide,
    generateSectionSlide: generateSectionSlide,
    generateTwoColumnTextImageSlide: generateTwoColumnTextImageSlide,
    generateQuoteSlide: generateQuoteSlide,
    generateAgendaSlide: generateAgendaSlide,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.slidesTemplate = api;
})(typeof window !== "undefined" ? window : globalThis);
