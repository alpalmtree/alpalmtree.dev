import { importGlob } from "../lib/helpers.js";

export const posts = await importGlob("./blog/**/metadata.js")
