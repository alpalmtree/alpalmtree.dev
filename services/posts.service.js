import { importGlob } from "../lib/helpers.js";

export const posts = await importGlob("./blog/**/metadata.js");

/** @type {import('#types').MetadataArray} */
export const allPostsMetadata = Object.values(posts.all).map(post => post.default)

export const slugs = Object.values(posts.all).map((post) => ({
  slug: post.default.slug,
}));
