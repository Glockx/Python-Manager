(async () => {
  await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    target: "node",
    format: "cjs",
    external: ["sudo-prompt"],
  });
})();
