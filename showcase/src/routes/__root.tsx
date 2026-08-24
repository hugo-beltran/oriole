import { Canvas } from "@mycodemedia/oriole";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <Canvas hue="cool">
      <main className="flex-1 p-16 max-w-400 mx-auto">
        <Outlet />
      </main>
    </Canvas>
  );
}
