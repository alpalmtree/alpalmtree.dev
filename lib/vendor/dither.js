/**
 * Code adapted from https://github.com/danielepiccone/ditherjs
 * Modifications:
 * - Use a more modern syntax
 * - Usage only for server
 * - Everything in a single, un-processed file
 * - Ditch options, since I'm "owning" the source code I can adjust it directly
 * - Remove debug options
 */

import * as Canvas from "canvas";

/**
 * Algorithm: (error diffusion)
 */

function errorDiffusionDither (uint8data, palette, step, h, w) {
  const d = new Uint8ClampedArray(uint8data);
  const out = new Uint8ClampedArray(uint8data);
  const ratio = 1 / 16;

  const $i = (x, y) => (4 * x) + (4 * y * w);

  let r, g, b, q, i, color, approx, tr, tg, tb, di;

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      i = (4 * x) + (4 * y * w);

      // Define bytes
      r = i;
      g = i + 1;
      b = i + 2;

      color = [d[r], d[g], d[b]];
      approx = this.approximateColor(color, palette);

      q = [];
      q[r] = d[r] - approx[0];
      q[g] = d[g] - approx[1];
      q[b] = d[b] - approx[2];

      // Diffuse the error
      d[$i(x + step, y)] = d[$i(x + step, y)] + 7 * ratio * q[r];
      d[$i(x - step, y + 1)] = d[$i(x - 1, y + step)] + 3 * ratio * q[r];
      d[$i(x, y + step)] = d[$i(x, y + step)] + 5 * ratio * q[r];
      d[$i(x + step, y + step)] = d[$i(x + 1, y + step)] + 1 * ratio * q[r];

      d[$i(x + step, y) + 1] = d[$i(x + step, y) + 1] + 7 * ratio * q[g];
      d[$i(x - step, y + step) + 1] = d[$i(x - step, y + step) + 1] +
        3 * ratio * q[g];
      d[$i(x, y + step) + 1] = d[$i(x, y + step) + 1] + 5 * ratio * q[g];
      d[$i(x + step, y + step) + 1] = d[$i(x + step, y + step) + 1] +
        1 * ratio * q[g];

      d[$i(x + step, y) + 2] = d[$i(x + step, y) + 2] + 7 * ratio * q[b];
      d[$i(x - step, y + step) + 2] = d[$i(x - step, y + step) + 2] +
        3 * ratio * q[b];
      d[$i(x, y + step) + 2] = d[$i(x, y + step) + 2] + 5 * ratio * q[b];
      d[$i(x + step, y + step) + 2] = d[$i(x + step, y + step) + 2] +
        1 * ratio * q[b];

      // Color
      tr = approx[0];
      tg = approx[1];
      tb = approx[2];

      // Draw a block
      for (let dx = 0; dx < step; dx++) {
        for (let dy = 0; dy < step; dy++) {
          di = i + (4 * dx) + (4 * w * dy);

          // Draw pixel
          out[di] = tr;
          out[di + 1] = tg;
          out[di + 2] = tb;
        }
      }
    }
  }
  return out;
};

/**
 * Utils
 */

const defaultPalette = [
  [0, 0, 0],
  [255, 255, 255],
];

const errors = {
  CanvasNotPresent: new Error("CanvasNotPresent"),
  TargetNotBuffer: new Error("TargetNotBuffer"),
  InvalidAlgorithm: new Error("InvalidAlgorithm"),
};

/**
 * Dither.js
 */

class _DitherJS {
  options = {
    algorithm: "ordered",
    step: 1,
    palette: defaultPalette,
  };

  ditherImageData(imageData) {
    const output = errorDiffusionDither.call(
      this,
      imageData.data,
      this.options.palette,
      this.options.step,
      imageData.height,
      imageData.width,
    );

    imageData.data.set(output);
  }

  colorDistance(a, b) {
    return Math.sqrt(
      Math.pow((a[0]) - (b[0]), 2) +
        Math.pow((a[1]) - (b[1]), 2) +
        Math.pow((a[2]) - (b[2]), 2),
    );
  }

  approximateColor(color, palette) {
    const findIndex = (fun, arg, list, min) => {
      if (list.length == 2) {
        if (fun(arg, min) <= fun(arg, list[1])) {
          return min;
        } else {
          return list[1];
        }
      } else {
        const tl = list.slice(1);
        if (fun(arg, min) <= fun(arg, list[1])) {
          min = min;
        } else {
          min = list[1];
        }
        return findIndex(fun, arg, tl, min);
      }
    };
    const foundColor = findIndex(
      this.colorDistance,
      color,
      palette,
      palette[0],
    );
    return foundColor;
  }

  _bufferToImageData(buffer) {
    if (!Canvas) {
      throw errors.CanvasNotPresent;
    }

    const createCanvas = Canvas.createCanvas;

    const img = new Canvas.Image();
    img.src = buffer;

    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0, img.width, img.height);

    return ctx.getImageData(0, 0, img.width, img.height);
  }

  _imageDataToBuffer(imageData) {
    if (!Canvas) {
      throw utils.errors.CanvasNotPresent;
    }

    const createCanvas = Canvas.createCanvas;

    const canvas = createCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);

    return canvas.toBuffer();
  }

  dither(buffer, options) {

    const imageData = this._bufferToImageData(buffer);

    this.ditherImageData(imageData, options);

    return this._imageDataToBuffer(imageData);
  }
}

export const DitherJS = new _DitherJS();
