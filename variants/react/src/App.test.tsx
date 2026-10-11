import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App", () => {
  it("renders the heading", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Frontend template" }),
    ).toBeInTheDocument();
  });

  it("increments the counter on click", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "count is 0" }));

    expect(
      screen.getByRole("button", { name: "count is 1" }),
    ).toBeInTheDocument();
  });
});
