import { ImageResponse } from 'next/og';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: '#0a0f1a',
          border: '2px solid #4ade80',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: '#4ade80',
            lineHeight: 1,
          }}
        >
          B
        </div>
      </div>
    ),
    { ...size }
  );
}
