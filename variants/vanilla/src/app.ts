/**
 * Renders the application into `root`.
 * Keep DOM building in small functions like this so each piece is easy to test.
 */
export function renderApp(root: HTMLElement): void {
  const main = document.createElement("main");
  main.className = "app";

  const heading = document.createElement("h1");
  heading.textContent = "Frontend template";

  main.append(heading, createCounter());
  root.replaceChildren(main);
}

function createCounter(): HTMLButtonElement {
  let count = 0;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "counter";

  const render = (): void => {
    button.textContent = `count is ${String(count)}`;
  };

  button.addEventListener("click", () => {
    count += 1;
    render();
  });

  render();
  return button;
}
