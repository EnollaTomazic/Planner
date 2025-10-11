# Planner Slide Generator

This repository includes a CLI utility for generating slide data used by Planner presentations. The tool reads slide content from a JSON file or from command line arguments and formats it with the shared typography and color constants.

## Prerequisites

- Node.js 18 or higher
- npm or yarn (optional, only required when installing dependencies)

## Usage

```bash
node answer.js [options]
```

### Options

- `-j, --json <path>` – Path to a JSON file that exports an array of slides or an object with a `slides` array.
- `-t, --title <value>` – Slide title. Repeat the option to define multiple slide titles from the CLI.
- `-s, --subtitle <value>` – Slide subtitle. Repeat per slide.
- `-i, --image <value>` – Slide image URL or path. Repeat per slide.
- `-c, --chart-data <value>` – Chart data per slide. Provide a JSON array or comma-separated values and repeat per slide.
- `-o, --output <path>` – Output file path. Defaults to `slides-output.json`.
- `--no-write` – Print the generated slide JSON to stdout instead of writing a file.

### Examples

Generate slides directly from the CLI:

```bash
node answer.js \
  --title "Introduction" --subtitle "What we'll cover" --image hero.png --chart-data "10,20,30" \
  --title "Roadmap" --subtitle "Milestones" --image roadmap.png --chart-data "[5, 15, 25]"
```

Use a JSON file as the source of truth:

```bash
node answer.js --json ./slides.json --output ./dist/presentation.json
```

Disable writing to a file and print the JSON:

```bash
node answer.js --json ./slides.json --no-write
```

## JSON Shape

The JSON input can be an array of slides or an object with a `slides` array:

```json
[
  {
    "title": "Overview",
    "subtitle": "A quick look at the plan",
    "image": "overview.png",
    "chartData": [30, 40, 60]
  }
]
```

```json
{
  "slides": [
    {
      "title": "Overview",
      "subtitle": "A quick look at the plan",
      "image": "overview.png",
      "chartData": [30, 40, 60]
    }
  ]
}
```

## Constants

Typography sizes and colors are stored in [`config/presentationConfig.js`](./config/presentationConfig.js) and automatically included with each generated slide.
