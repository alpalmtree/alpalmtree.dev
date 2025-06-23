import { importGlob } from "../lib/helpers.js";

export const posts = await importGlob("./blog/**/metadata.js");

export const slugs = Object.values(posts.all).map((post) => ({
  slug: post.default.slug,
}));
