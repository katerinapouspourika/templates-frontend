/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // Allow the :global() escape hatch used by CSS Modules.
    "selector-pseudo-class-no-unknown": [
      true,
      { ignorePseudoClasses: ["global", "local"] },
    ],
  },
};
