import { useState } from "react";

import styles from "./App.module.css";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main className={styles.app}>
      <h1>Frontend template</h1>
      <button
        type="button"
        className={styles.counter}
        onClick={() => {
          setCount((current) => current + 1);
        }}
      >
        count is {count}
      </button>
    </main>
  );
}
