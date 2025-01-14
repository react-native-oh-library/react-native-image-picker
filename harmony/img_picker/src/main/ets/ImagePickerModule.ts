/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
import { TurboModule, RNOHError, Tag } from '@rnoh/react-native-openharmony/ts';
import { ImagePicker } from "./generated/turboModules/ts"


export class ImagePickerModule extends TurboModule implements ImagePicker.Spec {
  private logger = this.ctx.logger.clone("ImagePickerModuleLogger")
  /**
   * RN0.61 imagepickerios
   */
  canRecordVideos(): void {
    this.logger.info('canRecordVideos has been invoked')
  }

  /**
   * RN0.61 imagepickerios
   */
  canUseCamera(): void {
    this.logger.info('canUseCamera has been invoked')
  }

  /**
   * RN0.61 imagepickerios
   */
  openCameraDialog(): void {
    this.logger.info('openCameraDialog has been invoked')
  }

  /**
   * RN0.61 imagepickerios
   */
  openSelectDialog(): void {
    this.logger.info('openSelectDialog has been invoked')
  }

  showImagePicker(options: ImagePicker.Options, callback: (response: ImagePicker.Response) => void): void;

  showImagePicker(callback: (response: ImagePicker.Response) => void): void;

  showImagePicker(options: unknown, callback?: unknown): void {

    this.logger.info('showImagePicker has been invoked')
  }

  launchCamera(options: ImagePicker.Options, callback: (response: ImagePicker.Response) => void): void;

  launchCamera(callback: (response: ImagePicker.Response) => void): void;

  launchCamera(options: unknown, callback?: unknown): void {
    this.logger.info('launchCamera has been invoked')
  }

  launchImageLibrary(options: ImagePicker.Options, callback: (response: ImagePicker.Response) => void): void;

  launchImageLibrary(callback: (response: ImagePicker.Response) => void): void;

  launchImageLibrary(options: unknown, callback?: unknown): void {
    this.logger.info('launchImageLibrary has been invoked')
  }

}
