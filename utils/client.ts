import sanityClient from "@sanity/client";

export const client = sanityClient({
  projectId: "8jzoki26",
  dataset: "production",
  apiVersion: "v2024-03-13",
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
});
