import { ImageResponse } from "next/og";
import { iconElement } from "@/lib/og-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon (used on "Add to Home Screen"). */
export default function AppleIcon() {
  return new ImageResponse(iconElement(180, 0.14), size);
}
