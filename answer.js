#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const { FONT_SIZES, COLORS, DEFAULT_OUTPUT_FILE } = require('./config/presentationConfig');

const collect = (value, accumulator) => {
  const next = accumulator || [];
  next.push(value);
  return next;
};

const parseChartData = (value) => {
  if (value == null) {
    return [];
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => (typeof entry === 'number' ? entry : Number(entry)));
    }
  } catch (error) {
    // fall back to comma-separated parsing
  }

  return trimmed
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const numeric = Number(entry);
      return Number.isNaN(numeric) ? entry : numeric;
    });
};

const hydrateSlide = (slide, index) => ({
  id: index + 1,
  title: slide.title || `Slide ${index + 1}`,
  subtitle: slide.subtitle || '',
  image: slide.image || null,
  chartData: Array.isArray(slide.chartData) ? slide.chartData : parseChartData(slide.chartData),
  styles: {
    fontSizes: FONT_SIZES,
    colors: COLORS,
  },
});

const readJsonSlides = (filePath) => {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const fileContents = fs.readFileSync(absolutePath, 'utf8');
  const parsed = JSON.parse(fileContents);
  const slides = Array.isArray(parsed) ? parsed : parsed.slides;

  if (!Array.isArray(slides)) {
    throw new Error('The JSON file must export an array or an object with a `slides` array.');
  }

  return slides.map((slide, index) => hydrateSlide(slide, index));
};

const buildSlidesFromCli = ({ titles = [], subtitles = [], images = [], chartData = [] }) => {
  const maxSlides = Math.max(titles.length, subtitles.length, images.length, chartData.length);

  if (maxSlides === 0) {
    throw new Error('No slide data was provided. Use --json <path> or CLI options to provide content.');
  }

  return Array.from({ length: maxSlides }).map((_, index) =>
    hydrateSlide(
      {
        title: titles[index],
        subtitle: subtitles[index],
        image: images[index],
        chartData: chartData[index],
      },
      index,
    ),
  );
};

const ensureDirectory = (targetPath) => {
  const directory = path.dirname(targetPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const writeSlides = (slides, destinationPath) => {
  const absolutePath = path.resolve(process.cwd(), destinationPath);
  ensureDirectory(absolutePath);
  fs.writeFileSync(absolutePath, JSON.stringify({ slides }, null, 2));
  return absolutePath;
};

const main = () => {
  program
    .name('answer')
    .description('Generate presentation slide data from CLI input or JSON files.')
    .option('-j, --json <path>', 'Path to a JSON file containing slide content')
    .option('-t, --title <value>', 'Slide title (repeat for multiple slides)', collect, [])
    .option('-s, --subtitle <value>', 'Slide subtitle (repeat for multiple slides)', collect, [])
    .option('-i, --image <value>', 'Slide image path or URL (repeat for multiple slides)', collect, [])
    .option(
      '-c, --chart-data <value>',
      'Chart data for a slide (JSON array or comma-separated values, repeat for multiple slides)',
      collect,
      [],
    )
    .option('-o, --output <path>', 'File path for generated slide data', DEFAULT_OUTPUT_FILE)
    .option('--no-write', 'Print slides to stdout instead of writing to a file')
    .parse(process.argv);

  const options = program.opts();

  let slides;

  if (options.json) {
    slides = readJsonSlides(options.json);
  } else {
    slides = buildSlidesFromCli({
      titles: options.title,
      subtitles: options.subtitle,
      images: options.image,
      chartData: options.chartData,
    });
  }

  if (options.write) {
    const destination = writeSlides(slides, options.output);
    console.log(`Slide data written to ${destination}`);
  } else {
    console.log(JSON.stringify({ slides }, null, 2));
  }
};

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  buildSlidesFromCli,
  readJsonSlides,
  parseChartData,
  hydrateSlide,
  writeSlides,
};
