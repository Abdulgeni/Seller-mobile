export function isRunningInExpoGo(): boolean {
  return false;
}

export function requireOptionalNativeModule(_moduleName: string): unknown {
  return null;
}

export function requireNativeModule(moduleName: string): unknown {
  return { name: moduleName };
}

export default {
  isRunningInExpoGo,
  requireOptionalNativeModule,
  requireNativeModule,
};
