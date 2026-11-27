export function getDominantColor(element) {
  if (!element || !element.complete || !element.naturalWidth) return null;

  const canvas = document.createElement("canvas");
  const size = 32;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  try {
    ctx.drawImage(element, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 32) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count += 1;
    }

    if (!count) return null;
    return {
      r: Math.floor(r / count),
      g: Math.floor(g / count),
      b: Math.floor(b / count),
    };
  } catch {
    return null;
  }
}
