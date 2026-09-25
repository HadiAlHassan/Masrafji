/**
 * Committed so CI typechecks CSS module imports (used by web-only components) without
 * relying on the gitignored, locally generated expo-env.d.ts.
 */
declare module '*.module.css' {
  const styles: { readonly [key: string]: string };
  export default styles;
}
