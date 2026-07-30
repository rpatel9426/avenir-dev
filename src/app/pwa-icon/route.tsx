import { ImageResponse } from "next/og";
import { iconElement } from "@/lib/og-icon";

export const runtime = "nodejs";

/**
 * PWA manifest icons at the sizes Android/desktop installs expect.
 * `/pwa-icon?s=192` and `/pwa-icon?s=512`. Extra padding keeps the mark inside
 * the maskable safe zone.
 */
export function GET(request: Request) {
  const s = Number(new URL(request.url).searchParams.get("s"));
  const size = s === 192 ? 192 : 512;
  return new ImageResponse(iconElement(size, 0.2), { width: size, height: size });
}
