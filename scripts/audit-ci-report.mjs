import fs from "node:fs";

const [reportPath = "audit-report.json"] = process.argv.slice(2);

function readReport(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Audit report not found at ${path}`);
  }

  const data = fs.readFileSync(path, "utf8");
  const trimmed = data.trim();

  if (trimmed.length === 0) {
    throw new Error(`Audit report at ${path} was empty`);
  }

  return JSON.parse(trimmed);
}

function formatSeverityTable(counts) {
  const order = [
    ["critical", "Critical"],
    ["high", "High"],
    ["moderate", "Moderate"],
    ["low", "Low"],
    ["info", "Info"],
  ];

  const header = ["| Severity | Count |", "| --- | --- |"];
  const rows = order.map(([key, label]) => {
    const value = counts[key] ?? 0;
    return `| ${label} | ${value} |`;
  });

  return ["## Dependency audit", "", ...header, ...rows, ""].join("\n");
}

function formatFinding(name, finding) {
  const severity = finding.severity ?? "unknown";
  const version = finding.installedVersion;
  const range = finding.range;
  const fix = finding.fixAvailable;
  const advisories = Array.isArray(finding.via)
    ? finding.via.filter((item) => typeof item === "object")
    : [];

  const advisoryText = advisories
    .map((advisory) => {
      const id = advisory.id ?? advisory.source;
      const title = advisory.title ?? advisory.name ?? "Unknown advisory";
      return `  - ${title}${id ? ` (${id})` : ""}`;
    })
    .join("\n");

  const fixLabel = (() => {
    if (fix === true) {
      return "Run `pnpm audit fix`";
    }

    if (fix && typeof fix === "object") {
      const target = [fix.name, fix.version].filter(Boolean).join("@");
      const upgrade = fix.isSemVerMajor ? " (requires major version upgrade)" : "";
      return target ? `Update to ${target}${upgrade}` : "Apply vendor patch";
    }

    return "No fix published yet";
  })();

  const details = [
    `- **${name}**@${version} (${severity})`,
    range ? `  - Affected range: ${range}` : null,
    `  - Recommended fix: ${fixLabel}`,
    advisoryText ? advisoryText : "  - No advisory metadata provided",
  ].filter(Boolean);

  return details.join("\n");
}

function buildSummary(report) {
  const counts = {
    info: 0,
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
  };

  const vulnerabilities = Object.entries(report.vulnerabilities ?? {});

  const metaCounts = report?.metadata?.vulnerabilities;
  if (metaCounts) {
    for (const key of Object.keys(counts)) {
      if (typeof metaCounts[key] === "number") {
        counts[key] = metaCounts[key];
      }
    }
  }

  if (!metaCounts) {
    for (const [, finding] of vulnerabilities) {
      const severity = String(finding.severity ?? "").toLowerCase();
      if (severity && severity in counts) {
        counts[severity] += 1;
      }
    }
  }

  const highFindings = vulnerabilities.filter(([, finding]) => {
    const severity = String(finding.severity ?? "").toLowerCase();
    return severity === "high" || severity === "critical";
  });

  const markdownSections = [formatSeverityTable(counts)];

  if (highFindings.length > 0) {
    const findingsText = highFindings
      .map(([name, finding]) => formatFinding(name, finding))
      .join("\n");

    markdownSections.push("### High severity findings", findingsText, "");
  } else {
    markdownSections.push("No high severity vulnerabilities detected.", "");
  }

  return { counts, highFindings, markdown: markdownSections.join("\n") };
}

try {
  const report = readReport(reportPath);
  const { highFindings, markdown } = buildSummary(report);

  console.log(markdown);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    fs.appendFileSync(summaryPath, `${markdown}\n`);
  }

  if (highFindings.length > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error("Failed to parse pnpm audit report:", error);
  process.exitCode = 1;
}
