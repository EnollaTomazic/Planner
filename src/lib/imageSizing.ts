export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageSizingOptions {
  /**
   * Force a specific aspect ratio (width / height). When provided, the input image
   * dimensions are normalized to this ratio before any calculations are performed.
   */
  forceAspectRatio?: number;
  /**
   * Optional clamp for the final scaled width.
   */
  maxWidth?: number;
  /**
   * Optional clamp for the final scaled height.
   */
  maxHeight?: number;
  /**
   * When true the image will never be scaled above its natural resolution.
   */
  preventUpscale?: boolean;
}

export interface ImageSizingResult {
  width: number;
  height: number;
  /** The ratio applied to the original width. */
  scaleX: number;
  /** The ratio applied to the original height. */
  scaleY: number;
  /** Horizontal offset after scaling so the image stays centred. */
  offsetX: number;
  /** Vertical offset after scaling so the image stays centred. */
  offsetY: number;
}

const MIN_DIMENSION = 0.5;

function normalizeDimensions(dimensions: ImageDimensions): ImageDimensions {
  const width = Number.isFinite(dimensions.width) ? Math.max(dimensions.width, 0) : 0;
  const height = Number.isFinite(dimensions.height) ? Math.max(dimensions.height, 0) : 0;
  if (width === 0 || height === 0) {
    return { width: MIN_DIMENSION, height: MIN_DIMENSION };
  }
  return { width, height };
}

function resolveAspectRatio(
  image: ImageDimensions,
  options?: ImageSizingOptions,
): number {
  if (options?.forceAspectRatio && options.forceAspectRatio > 0) {
    return options.forceAspectRatio;
  }
  const { width, height } = normalizeDimensions(image);
  return width / height;
}

function clampToMaximum(
  value: number,
  maximum?: number,
): number {
  if (!maximum || maximum <= 0) {
    return value;
  }
  return Math.min(value, maximum);
}

function applyResolutionConstraints(
  result: ImageSizingResult,
  options?: ImageSizingOptions,
  original?: ImageDimensions,
): ImageSizingResult {
  const baseWidth = original?.width ?? result.width;
  const baseHeight = original?.height ?? result.height;

  let width = result.width;
  let height = result.height;
  let scaleX = result.scaleX;
  let scaleY = result.scaleY;

  width = clampToMaximum(width, options?.maxWidth);
  height = clampToMaximum(height, options?.maxHeight);

  if (options?.preventUpscale) {
    width = Math.min(width, baseWidth);
    height = Math.min(height, baseHeight);
  }

  // Recompute scale values in case we clamped the output size.
  scaleX = width / baseWidth;
  scaleY = height / baseHeight;

  return {
    ...result,
    width,
    height,
    scaleX,
    scaleY,
  };
}

function createResult(
  scaledWidth: number,
  scaledHeight: number,
  original: ImageDimensions,
): ImageSizingResult {
  const offsetX = (scaledWidth - original.width) / 2;
  const offsetY = (scaledHeight - original.height) / 2;

  return {
    width: scaledWidth,
    height: scaledHeight,
    scaleX: scaledWidth / original.width,
    scaleY: scaledHeight / original.height,
    offsetX,
    offsetY,
  };
}

export function imageSizingContain(
  image: ImageDimensions,
  container: ImageDimensions,
  options?: ImageSizingOptions,
): ImageSizingResult {
  const normalizedImage = normalizeDimensions(image);
  const normalizedContainer = normalizeDimensions(container);
  const aspect = resolveAspectRatio(normalizedImage, options);

  const targetWidth = normalizedContainer.width;
  const targetHeight = normalizedContainer.height;

  // Determine the ideal fit for the forced ratio while keeping everything centred.
  const containerRatio = targetWidth / targetHeight;
  let fittedWidth: number;
  let fittedHeight: number;

  if (containerRatio > aspect) {
    fittedHeight = targetHeight;
    fittedWidth = fittedHeight * aspect;
  } else {
    fittedWidth = targetWidth;
    fittedHeight = fittedWidth / aspect;
  }

  const result = createResult(fittedWidth, fittedHeight, normalizedImage);
  return applyResolutionConstraints(result, options, normalizedImage);
}

export function imageSizingCrop(
  image: ImageDimensions,
  container: ImageDimensions,
  options?: ImageSizingOptions,
): ImageSizingResult {
  const normalizedImage = normalizeDimensions(image);
  const normalizedContainer = normalizeDimensions(container);
  const aspect = resolveAspectRatio(normalizedImage, options);

  const targetWidth = normalizedContainer.width;
  const targetHeight = normalizedContainer.height;

  const containerRatio = targetWidth / targetHeight;
  let scaledWidth: number;
  let scaledHeight: number;

  if (containerRatio > aspect) {
    scaledWidth = targetWidth;
    scaledHeight = scaledWidth / aspect;
  } else {
    scaledHeight = targetHeight;
    scaledWidth = scaledHeight * aspect;
  }

  const result = createResult(scaledWidth, scaledHeight, normalizedImage);
  return applyResolutionConstraints(result, options, normalizedImage);
}

export function resolveImageAspectRatio(
  image: ImageDimensions,
  options?: ImageSizingOptions,
): number {
  return resolveAspectRatio(image, options);
}

export function limitToMaxDimensions(
  dimensions: ImageDimensions,
  options?: ImageSizingOptions,
): ImageDimensions {
  const width = clampToMaximum(dimensions.width, options?.maxWidth);
  const height = clampToMaximum(dimensions.height, options?.maxHeight);
  return { width, height };
}
