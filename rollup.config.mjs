import vue from "rollup-plugin-vue";
import node from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import fs from 'fs'

fs.rmSync('dist', { recursive: true, force: true });

const vuePluginConfig = {
  template: {
    isProduction: true,
    compilerOptions: {
      whitespace: "condense",
    },
  },
};

const config = [
  {
    input: "./index.ts",
    external: ["vue"],
    output: { format: "es", file: "dist/index.js",sourcemap: true, },
    plugins: [
      node({
        rootDir: ".",
        extensions: [".vue", ".ts"],
      }),
      vue(vuePluginConfig),
      typescript({useTsconfigDeclarationDir:true},
      ),
    ],
  },
];

export default () => {
  return config;
};