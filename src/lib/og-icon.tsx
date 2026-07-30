/**
 * The Avenir app icon, rendered on the fly by Next's image generation
 * (`next/og`) — so there are no binary PNG assets to maintain. Used for the
 * favicon, the iOS home-screen icon, and the PWA manifest icons.
 *
 * The mark is the same forward-leaning chevron as the in-app logo, lime→violet
 * on the near-black canvas.
 */

const MARK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'>
<defs><linearGradient id='g' x1='4' y1='28' x2='28' y2='4' gradientUnits='userSpaceOnUse'>
<stop stop-color='#c6f24e'/><stop offset='1' stop-color='#8f7bf5'/></linearGradient></defs>
<path d='M6 25.5 L15 6.5 a1.6 1.6 0 0 1 2.9 0 L27 25.5' stroke='url(#g)' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/>
<path d='M11.5 25.5 L16.5 15' stroke='#c6f24e' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round' opacity='0.55'/>
</svg>`;

const MARK_DATA_URI = `data:image/svg+xml,${encodeURIComponent(MARK_SVG)}`;

/**
 * Returns the icon element for `ImageResponse`.
 * @param px   the square icon size in pixels
 * @param pad  fraction of padding around the mark (bigger = smaller mark; use
 *             more padding for maskable icons so the mark stays in the safe zone)
 */
export function iconElement(px: number, pad = 0.16) {
  const markSize = Math.round(px * (1 - pad * 2));
  return (
    <div
      style={{
        width: px,
        height: px,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0d11",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MARK_DATA_URI} width={markSize} height={markSize} alt="" />
    </div>
  );
}
