// Twitter card image for shared /find links. Same render as opengraph-image,
// but route-segment config has to be statically declared per file (Next.js
// can't follow re-exports of `runtime`).
import OpenGraphImage from "./opengraph-image";

export const runtime = "edge";
export const alt = "Find my parking spot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OpenGraphImage;
