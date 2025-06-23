import { DitherJS } from "../lib/vendor/dither.js";
import sharp from "sharp";
import { readFile } from "node:fs";

const imagePath = Deno.args.at(0).startsWith("/")
  ? Deno.args.at(0).replace("/", "")
  : Deno.args.at(0);

if (!imagePath) Deno.exit();

const parentFolder = imagePath.split("/").slice(0, -1).join("/")
console.log(parentFolder)

Deno.exit()
readFile(`${Deno.cwd()}/${imagePath}`, (_, data) => {
  const result = DitherJS.dither(data);

  console.log("Writing LG image");
  sharp(result).resize(950, 712, { fit: "inside" }).toFormat("webp").toFile(
    `${Deno.cwd()}/img_lg.webp`,
  );

  console.log("Writing MD image");
  sharp(result).resize(700, 524, { fit: "inside" }).toFormat("webp").toFile(
    `${Deno.cwd()}/img_md.webp`,
  );

  console.log("Writing SM image");
  sharp(result).resize(411, 308, { fit: "inside" }).toFormat("webp").toFile(
    `${Deno.cwd()}/img_sm.webp`,
  );
});
