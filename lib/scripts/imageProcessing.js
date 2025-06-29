import sharp from "sharp";
import { readFile } from "node:fs";

const imagePath = Deno.args.at(0).startsWith("/")
  ? Deno.args.at(0).replace("/", "")
  : Deno.args.at(0);

if (!imagePath) Deno.exit();

const parentFolder = imagePath.split("/").slice(0, -1).join("/")

readFile(`${Deno.cwd()}/${imagePath}`, (_, data) => {

  console.log("Writing LG image");
  sharp(data).resize(950, 712, { fit: "inside" }).toFormat("webp").toFile(
    `${Deno.cwd()}/${parentFolder}/img_lg.webp`,
  );

  console.log("Writing MD image");
  sharp(data).resize(700, 524, { fit: "inside" }).toFormat("webp").toFile(
    `${Deno.cwd()}/${parentFolder}/img_md.webp`,
  );

  console.log("Writing SM image");
  sharp(data).resize(411, 308, { fit: "inside" }).toFormat("webp").toFile(
    `${Deno.cwd()}/${parentFolder}/img_sm.webp`,
  );
});
