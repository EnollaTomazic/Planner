declare module "playwright-core/lib/server/registry" {
  type RegistryExecutable = {
    executablePath?: () => string | undefined;
  };

  export const registry: {
    findExecutable(name: string): RegistryExecutable | undefined;
  };
}
