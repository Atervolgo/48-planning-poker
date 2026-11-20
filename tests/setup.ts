import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Sin `globals: true`, Testing Library no limpia solo: sin esto el DOM se acumula entre pruebas
afterEach(() => cleanup());
