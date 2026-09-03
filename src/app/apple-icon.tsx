import { ImageResponse } from 'next/og';

/**
 * Apple touch icon. iOS will not accept an SVG, so this is rendered to PNG at
 * build time rather than checked in as a binary asset.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="112" height="112">
<path d="M12 30 L31 82 L48 44 L64 82 L69 62" stroke="#ffffff" stroke-width="15" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="12" fill="none"/>
<path d="M56.7 80.2 L71.3 83.8 L82.4 27.1 L73.6 24.9 Z" fill="#ffffff"/>
<path d="M88.5 0 Q90.4 8 97.5 10.2 Q90.4 12.4 88.5 20.5 Q86.6 12.4 79.5 10.2 Q86.6 8 88.5 0 Z" fill="#818cf8"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#0d0f14',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`} width={112} height={112} alt="" />
      </div>
    ),
    size,
  );
}
