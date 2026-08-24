import { useId } from "react";

export function BackgroundNoise() {
  const id = useId();

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.35"
          numOctaves="5"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="overlay" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} opacity="0.016" />
    </svg>
  );
}
