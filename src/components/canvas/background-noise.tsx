import { useId } from "react"
import styles from "./canvas.module.css"

/** Film-grain overlay for the Canvas. */
function BackgroundNoise() {
  const id = useId()

  return (
    <svg className={styles.noise} aria-hidden="true">
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
      <rect width="100%" height="100%" filter={`url(#${id})`} opacity="0.03" />
    </svg>
  )
}

export { BackgroundNoise }
