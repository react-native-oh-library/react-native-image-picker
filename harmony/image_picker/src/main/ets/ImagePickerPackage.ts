import { RNPackage, TurboModulesFactory } from 'rnoh/ts';
import type { TurboModule, TurboModuleContext } from 'rnoh/ts';
import { ImagePickerTurboModule } from './ImagePickerTurboModule';

class ImagePickerTurboModulesFactory extends TurboModulesFactory {

  createTurboModule(name: string): TurboModule | null {
    if (name === 'ImagePicker') {
      return new ImagePickerTurboModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === 'ImagePicker';
  }

}

export class ImagePickerViewPackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new ImagePickerTurboModulesFactory(ctx);
  }
}
