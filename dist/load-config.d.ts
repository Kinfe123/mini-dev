import type { DevServerOptions } from './types.js';
/**
 * Load config from mini-dev.config.{ts,js,mjs,cjs} in root.
 * CLI args take precedence over config.
 */
export declare function loadConfig(root: string): Promise<Partial<DevServerOptions>>;
//# sourceMappingURL=load-config.d.ts.map