const { sin, cos, abs, max, floor, random, PI } = Math;
const TAU = 2 * PI;
const size = 512;

interface ToCartesianOptions {
  r: number;
  d?: number;
  offset?: [number, number];
}

function toCartesian({
  r: angle,
  d: distance = 1,
  offset: [x, y] = [0, 0],
}: ToCartesianOptions): [number, number] {
  return [
    // combines well with destructing and composes with offset
    x + cos(angle) * distance,
    y + sin(angle) * distance,
  ];
}

interface CreatePolygonPathOptions {
  rotation: number;
  sides: number;
  smoothness: number;
}

export function createPolygonPath({
  rotation,
  sides,
  smoothness,
}: CreatePolygonPathOptions) {
  const maxSmooth = 2 * sin(PI / sides);

  const angle = (1 / sides) * TAU;
  const rotationScaled = rotation * angle - TAU / 4;
  const [sx, sy] = toCartesian({ r: rotationScaled });

  function findMaxBound(r: number) {
    const [x, y] = toCartesian({ r: angle * (1 + 1) + r });
    const [x1, y1] = toCartesian({
      r: angle * 1 + TAU / 4 + r,
      d: smoothness * maxSmooth,
      offset: toCartesian({ r: angle * 1 + r }),
    });
    const [x2, y2] = toCartesian({
      r: angle * (1 + 1) - TAU / 4 + r,
      d: smoothness * maxSmooth,
      offset: toCartesian({ r: angle * (1 + 1) + r }),
    });

    return max(
      abs((1 - 0.5) ** 2 * x1 + 2 * (1 - 0.5) * 0.5 * x2 + 0.5 ** 2 * x),
      abs((1 - 0.5) ** 2 * y1 + 2 * (1 - 0.5) * 0.5 * y2 + 0.5 ** 2 * y),
    );
  }

  const bounds = max(
    1,
    findMaxBound(0),
    findMaxBound(angle),
    findMaxBound(angle / 2),
  );

  const x = -bounds;
  const y = -bounds;
  const width = 2 * bounds;
  const height = 2 * bounds;

  return {
    path: `M ${sx} ${sy} ${Array.from({ length: sides })
      .map((_, i) => {
        const [x, y] = toCartesian({ r: angle * (i + 1) + rotationScaled });

        const [x1, y1] = toCartesian({
          r: angle * i + TAU / 4 + rotationScaled,
          d: smoothness * maxSmooth,
          offset: toCartesian({ r: angle * i + rotationScaled }),
        });

        const [x2, y2] = toCartesian({
          r: angle * (i + 1) - TAU / 4 + rotationScaled,
          d: smoothness * maxSmooth,
          offset: toCartesian({ r: angle * (i + 1) + rotationScaled }),
        });

        return `C ${[x1, y1, x2, y2, x, y].join(' ')}`;
      })
      .join(' ')}`,
    x,
    y,
    width,
    height,
    viewBox: `${x} ${y} ${width} ${height}`,
    bounds,
  };
}

export function fileToDataUri(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', (e) => {
      // @ts-expect-error
      resolve(e.currentTarget.result);
    });
    reader.addEventListener('error', reject);

    reader.readAsDataURL(file);
  });
}

export async function svgToPngDataUrl(svg: SVGSVGElement | null) {
  // used for the promise suspender
  if (!svg) return new Promise<never>(() => {});

  // convert to data URL
  const svgDataUrl = `data:image/svg+xml,${encodeURIComponent(
    new XMLSerializer().serializeToString(svg.cloneNode(true)),
  )}`;

  // load image
  const image = new Image();
  setTimeout(() => {
    image.src = svgDataUrl;
  }, 0);
  await new Promise((resolve, reject) => {
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
  });

  // get 2d context from canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2D context.');

  // draw the image to the canvas
  context.drawImage(image, 0, 0, size, size);
  context.fillStyle = '#888';
  context.font = '12px Arial';
  context.fillText('hexagonpfp.org', size - 90, size - 26);
  return canvas.toDataURL('image/png');
}

interface CropImageOptions {
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function cropImage({
  imageUrl,
  x,
  y,
  width,
  height,
}: CropImageOptions) {
  // load image
  const image = new Image();
  setTimeout(() => {
    image.src = imageUrl;
  }, 0);
  await new Promise((resolve, reject) => {
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
  });

  // get 2d context from canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2D context.');

  // draw the image to the canvas
  context.drawImage(image, -x, -y, image.width, image.height);
  return canvas.toDataURL('image/png');
}

export async function scaleImage(imageUrl: string) {
  // load image
  const image = new Image();
  setTimeout(() => {
    image.src = imageUrl;
  }, 0);
  await new Promise((resolve, reject) => {
    image.addEventListener('load', resolve);
    image.addEventListener('error', reject);
  });

  // get 2d context from canvas
  const canvas = document.createElement('canvas');

  const width = max(image.width, 1920);
  const height = (image.height / image.width) * width;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2D context.');

  // draw the image to the canvas
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/png');
}

export function randomId() {
  return `id-${Array.from({ length: 3 })
    .map(() => floor(random() * 255).toString(16))
    .join('')}`;
}

const ids = new WeakMap();

export function assignId(obj: object | null) {
  if (!obj) return 'null';

  const id = ids.get(obj);
  if (id) return id;

  const newId = randomId();
  ids.set(obj, newId);
  return newId;
}

export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
}
