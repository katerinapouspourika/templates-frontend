import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { renderApp } from "./app";

describe("renderApp", () => {
  beforeEach(() => {
    const root = document.createElement("div");
    document.body.replaceChildren(root);
    renderApp(root);
  });

  it("renders the heading", () => {
    expect(
      screen.getByRole("heading", { level: 1, name: "Frontend template" }),
    ).toBeInTheDocument();
  });

  it("increments the counter on click", async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "count is 0" }));

    expect(
      screen.getByRole("button", { name: "count is 1" }),
    ).toBeInTheDocument();
  });
});
