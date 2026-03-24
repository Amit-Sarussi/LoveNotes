import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoWidgetReloadNative extends NativeModule {
  reloadTimelines(): Promise<void>;
}

const native = requireNativeModule<ExpoWidgetReloadNative>('ExpoWidgetReload');

export function reloadWidgetTimelines(): Promise<void> {
  return native.reloadTimelines();
}

export default native;
