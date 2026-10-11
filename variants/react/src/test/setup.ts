// Adds DOM matchers such as toBeInTheDocument() and toHaveTextContent() to Vitest.
import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest runs without globals, so Testing Library cannot unmount between tests on its own.
afterEach(() => {
  cleanup();
});
