import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { useThemeSync } from "./app/layout/UseTheme";

export default function App() {
  useThemeSync();
  return <RouterProvider router={router} />;
}
