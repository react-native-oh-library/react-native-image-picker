/*
 * MIT License
 *
 * Copyright (C) 2023 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANT KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import fs from '@ohos.file.fs';
import image from '@ohos.multimedia.image';
import wantConstant from '@ohos.app.ability.wantConstant';
import util from '@ohos.util';
import { TurboModule } from 'rnoh/ts';
import type { TurboModuleContext } from 'rnoh/ts';
import type Want from '@ohos.app.ability.Want';
import Logger from './Logger'

export type MediaType = 'photo' | 'video' | 'mixed';

export type CameraType = 'back' | 'front';

export type PhotoQuality = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

export type AndroidVideoOptions = 'low' | 'high';

export type ErrorCode = 'camera_unavailable' | 'permission' | 'others';

export class OptionsCommon {
  mediaType: MediaType;
  maxWidth?: number;
  maxHeight?: number;
  quality?: PhotoQuality;
  videoQuality?: AndroidVideoOptions;
  includeBase64?: boolean;
  includeExtra?: boolean;
  formatAsMp4?: boolean;
  presentationStyle?: 'currentContext' | 'fullScreen' | 'pageSheet' | 'formSheet' | 'popover' | 'overFullScreen' | 'overCurrentContext';
  assetRepresentationMode?: 'auto' | 'current' | 'compatible';
}

export class Asset {
  base64?: string;
  uri?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
  duration?: number;
  bitrate?: number;
  timestamp?: string;
  id?: string;
  originalPath?: string;
}

export class ImagePickerResponse {
  didCancel?: boolean;
  errorCode?: ErrorCode;
  errorMessage?: string;
  assets?: Asset[];
}

export class AbilityResult {
  resultCode: number;
  want?: Want;
}

export class ImageLibraryOptions extends OptionsCommon {
  selectionLimit?: number;
}

export interface CameraOptions extends OptionsCommon {
  durationLimit?: number;
  saveToPhotos?: boolean;
  cameraType?: CameraType;
}

export class ImagePickerTurboModule extends TurboModule {
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  }

  launchCamera(options?: CameraOptions): void {
    Logger.info('launchCamera', JSON.stringify(options));
  }

  launchImageLibrary(options?: ImageLibraryOptions, callback?: (e) => void): void {
    let res = this.startAbilityToImage(options.mediaType, options.selectionLimit, wantConstant.Flags.FLAG_AUTH_WRITE_URI_PERMISSION)
    res.then((e) => {
      Logger.info(JSON.stringify(e));
      callback(e);
    }).catch((e) => {
      //返回出错数据
      callback(e);
    })
  }

  async startAbilityToImage(type: MediaType, selectionLimit: number, action: wantConstant.Flags | string): Promise<ImagePickerResponse> {
    let results: ImagePickerResponse = { assets: [] }
    if (selectionLimit > 100) {
      results.didCancel = true
      return results
    }
    let want = {
      "deviceId": "",
      "bundleName": "",
      "abilityName": "",
      "uri": "",
      "type": "image/*",
      "action": action,
      "parameters": {
        uri: 'multipleselect',
        maxSelectCount: selectionLimit,
        filterMediaType: type == 'photo' ? 'FILTER_MEDIA_TYPE_IMAGE' : (type == 'video' ? 'FILTER_MEDIA_TYPE_VIDEO' : 'FILTER_MEDIA_TYPE_ALL')
      },
      "entities": []
    }

    let result: AbilityResult = await this.ctx.uiAbilityContext.startAbilityForResult(want as Want);
    if (result.resultCode == -1) {
      results.didCancel = true
      return results
    }

    let images: Array<string> = result.want.parameters['select-item-list'] as Array<string>
    for (let value of images) {
      let imgObj: Asset = {}
      const mimeUri = value.substring(0, 4)
      if (mimeUri === 'file') {
        let i = value.lastIndexOf('/')
        imgObj.fileName = value.substring(i + 1)
        i = value.lastIndexOf('.')
        imgObj.type = 'Unknown'
        if (i != -1) {
          imgObj.type = value.substring(i + 1)
        }
      }
      let file = fs.openSync(value, fs.OpenMode.CREATE)
      let stat = fs.statSync(file.fd);
      imgObj.originalPath = value
      try {
        let filePath = this.ctx.uiAbilityContext.cacheDir + '/rn_image_picker_lib_temp_' + util.generateRandomUUID(true) + '.' + imgObj.type
        fs.copyFileSync(file.fd, filePath, 0)
        imgObj.uri = 'file://' + filePath
      } catch (e) {
        Logger.info('复制到应用缓存区失败!', JSON.stringify(e));
      }
      imgObj.fileSize = stat.size;
      if (type === 'photo') {
        let imageIS = image.createImageSource(file.fd)
        let imagePM = await imageIS.createPixelMap()
        let imgInfo = await imagePM.getImageInfo()
        imgObj.height = imgInfo.size.width
        imgObj.width = imgInfo.size.height
        imagePM.release().then(() => {
          imagePM = undefined
        })
        imageIS.release().then(() => {
          imageIS = undefined
        })
      }
      fs.closeSync(file);
      results.assets.push(imgObj)
    }
    return results;
  }
}