import { ImageResponse } from "next/og";
import { iconElement } from "@/lib/og-icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon / browser-tab + Android icon. */
export default function Icon() {
  return new ImageResponse(iconElement(64, 0.1), size);
}
