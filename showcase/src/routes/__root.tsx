import { Canvas } from "@mycodemedia/oriole"
import { createRootRoute, Outlet } from "@tanstack/react-router"
import styles from "./__root.module.css"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <Canvas animated>
      <main className={styles.main}>
        <Outlet />
      </main>
    </Canvas>
  )
}
