import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'Logflix — Agree on what to watch. Instantly.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), 'public/logo.png'));
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {/* Rød gradient bakgrunn */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,42,42,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Logo */}
        <img src={logoBase64} width={320} style={{ objectFit: 'contain' }} />

        {/* Headline */}
        <div style={{
          fontSize: 52,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: 800,
          display: 'flex',
        }}>
          Agree on what to watch. Instantly.
        </div>

        {/* Subtext */}
        <div style={{
          fontSize: 28,
          color: 'rgba(255,255,255,0.45)',
          textAlign: 'center',
          display: 'flex',
        }}>
          Free. No account needed.
        </div>

        {/* Rød linje nederst */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: '#ff2a2a',
          display: 'flex',
        }} />
      </div>
    ),
    { ...size }
  );
}
