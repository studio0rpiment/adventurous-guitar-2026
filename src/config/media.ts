/**
 * Central media source map. Call sites reference MEDIA.* so the actual URLs
 * live in one place.
 *
 * Today these point at local files in /public/img (they ship with the build).
 * You serve media from Cloudinary — when these assets are uploaded there, set
 * CLOUDINARY_CLOUD and swap the values to `cld("public-id")`. Nothing else
 * needs to change. `f_auto,q_auto` lets Cloudinary pick modern formats
 * (AVIF/WebP) and tune quality per request — a big win for the ~1.5 MB stage
 * photo.
 */

// const CLOUDINARY_CLOUD = "your-cloud-name";
// export const cld = (publicId: string, transforms = "f_auto,q_auto") =>
//   `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${transforms}/${publicId}`;

export const MEDIA = {
  stageBackground: "/img/stage-background.jpg",
  stageBackgroundMobile: "/img/stage-background-mobile.jpg",
  logo: "/img/aeg-Logo.jpg",
} as const;

export type MediaKey = keyof typeof MEDIA;
