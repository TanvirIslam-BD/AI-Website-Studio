import { ImageResponse } from 'next/og';
import { BRAND } from '@/lib/brand';

/**
 * Link-preview image for social and chat unfurls. Generated at build time so
 * there is no binary asset to keep in sync with the brand.
 */
export const alt = `${BRAND.name} - ${BRAND.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150">
<path d="M12 30 L31 82 L48 44 L64 82 L69 62" stroke="#ffffff" stroke-width="15" stroke-linejoin="miter" stroke-linecap="butt" stroke-miterlimit="12" fill="none"/>
<path d="M56.7 80.2 L71.3 83.8 L82.4 27.1 L73.6 24.9 Z" fill="#ffffff"/>
<path d="M88.5 0 Q90.4 8 97.5 10.2 Q90.4 12.4 88.5 20.5 Q86.6 12.4 79.5 10.2 Q86.6 8 88.5 0 Z" fill="#818cf8"/>
</svg>`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '90px',
          background: '#0d0f14',
          backgroundImage: 'radial-gradient(60% 70% at 82% 8%, rgba(99,102,241,0.42), transparent 70%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`} width={150} height={150} alt="" />

        <div style={{ display: 'flex', color: '#ffffff', fontSize: 86, fontWeight: 700, letterSpacing: '-0.035em', marginTop: 44 }}>
          Web Copilot AI Studio
        </div>

        <div style={{ display: 'flex', color: '#9aa3b5', fontSize: 34, letterSpacing: '0.16em', marginTop: 26 }}>
          BUILD SMART · LAUNCH FASTER
        </div>

        <div style={{ display: 'flex', color: '#6b7385', fontSize: 27, marginTop: 40 }}>
          {BRAND.tagline}
        </div>
      </div>
    ),
    size,
  );
}
