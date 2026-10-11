import "./styles/global.css";
import "./app.css";

import { renderApp } from "./app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Root element #app was not found in index.html");
}

renderApp(root);
