/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
import {
  TurboModulesFactory,
  RNPackage} from '@rnoh/react-native-openharmony/ts';
import type {
  TurboModule,
  TurboModuleContext,
  DescriptorWrapperFactoryByDescriptorTypeCtx,
  DescriptorWrapperFactoryByDescriptorType
} from '@rnoh/react-native-openharmony/ts';
import { ImagePicker } from "./generated/turboModules/ts"
import { ImagePickerModule } from './ImagePickerModule';


class ImagePickerModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === ImagePicker.NAME) {
      return new ImagePickerModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === ImagePicker.NAME;
  }
}


export class ImagePickerPackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new ImagePickerModulesFactory(ctx);
  }
}
