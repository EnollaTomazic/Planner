declare module "cli-progress" {
  export class MultiBar {
    constructor(options?: any, preset?: any);
    create(total: number, startValue?: number): any;
    stop(): void;
  }
  export const Presets: any;
}
