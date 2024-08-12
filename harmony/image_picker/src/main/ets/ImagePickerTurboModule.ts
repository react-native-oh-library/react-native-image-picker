/**
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
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
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
import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import type { TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import type Want from '@ohos.app.ability.Want';
import Logger from './Logger';


import picker from '@ohos.multimedia.cameraPicker';
import camera from '@ohos.multimedia.camera'
import { BusinessError } from '@kit.BasicServicesKit';
import cameraPicker from '@ohos.multimedia.cameraPicker';
import { buffer } from '@kit.ArkTS';
import { photoAccessHelper } from '@kit.MediaLibraryKit';

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

const PHOTO_EXT_LIST = ['xbm','tif','pjp','svgz','jpg','jpeg','ico','tiff','gif','svg','jfif','webp','png','bmp','pjpeg','avif']

function isPhoto(ext: string) {
  PHOTO_EXT_LIST.includes(ext);
}

export class ImagePickerTurboModule extends TurboModule {
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  }

  base64Helper = new util.Base64Helper();

  public getMediaTypeByOption(mediaType: MediaType): cameraPicker.PickerMediaType[] {
    let mediaTypeArr: cameraPicker.PickerMediaType[] = [];
    if (mediaType === 'photo') {
      mediaTypeArr.push(picker.PickerMediaType.PHOTO)
    }
    if (mediaType === 'video') {
      mediaTypeArr.push(picker.PickerMediaType.VIDEO)
    }
    if (mediaType === 'mixed') {
      mediaTypeArr = [picker.PickerMediaType.PHOTO, picker.PickerMediaType.VIDEO]
    }
    return mediaTypeArr;
  }

  public async launchCamera(options: CameraOptions, callback: (e) => void): Promise<void> {
    Logger.info('launchCamera', JSON.stringify(options));
    let results: ImagePickerResponse = { assets: [] };
    try {
      let pickerProfile: picker.PickerProfile = {
        cameraPosition: camera.CameraPosition.CAMERA_POSITION_BACK
      };
      if (options.cameraType === "front") {
        pickerProfile.cameraPosition = camera.CameraPosition.CAMERA_POSITION_FRONT;
      };
      let pickerResult: picker.PickerResult = await picker.pick(
        this.ctx.uiAbilityContext,
        this.getMediaTypeByOption(options.mediaType),
        pickerProfile
      );
      if (pickerResult.resultCode == -1) {
        results.didCancel = true
        callback(results)
        return;
      };
      results.assets?.push(
        await this.getAsset(pickerResult.resultUri, options)
      );
      callback(results);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(`the pick call failed. error code: ${err.code} ${err.message}`);
    }
  }

  launchImageLibrary(options: ImageLibraryOptions, callback: (e) => void): void {
    let res = this.startAbilityToImage(options.mediaType, options.selectionLimit, wantConstant.Flags.FLAG_AUTH_WRITE_URI_PERMISSION, options)
    res.then((e) => {
      Logger.info(JSON.stringify(e));
      callback(e);
    }).catch((e) => {
      //返回出错数据
      callback(e);
    })
  }

  async startAbilityToImage(type: MediaType, selectionLimit: number, action: wantConstant.Flags | string, options: ImageLibraryOptions): Promise<ImagePickerResponse> {
    let results: ImagePickerResponse = { assets: [] }
    if (selectionLimit > 100) {
      results.didCancel = true
      return results
    }
    try {
      let PhotoSelectOptions = new photoAccessHelper.PhotoSelectOptions();
      const Types = photoAccessHelper.PhotoViewMIMETypes;
      PhotoSelectOptions.MIMEType = type == 'photo' ? Types.IMAGE_TYPE : (type == 'video' ? Types.VIDEO_TYPE : Types.IMAGE_VIDEO_TYPE);
      PhotoSelectOptions.maxSelectNumber = selectionLimit;
      let photoPicker = new photoAccessHelper.PhotoViewPicker();
      let data = await photoPicker.select(PhotoSelectOptions).then(async (PhotoSelectResult: photoAccessHelper.PhotoSelectResult) => {
        let images: Array<string> = PhotoSelectResult.photoUris;
        for (let value of images) {
          results.assets.push(await this.getAsset(value, options))
        }
        return results;
      }
      ).catch((err: BusinessError) => {
        console.error(`PhotoViewPicker.select failed with err: ${err.code}, ${err.message}`);
      });
      if(data) {
        return data;
      }
    } catch (error) {
      let err: BusinessError = error as BusinessError;
      console.error(`PhotoViewPicker failed with err: ${err.code}, ${err.message}`);
    }
  }


  private async getAsset(uri: string, options: ImageLibraryOptions) {
    const pickerMediaType = options.mediaType;
    let imgObj: Asset = {}
    const { fileName, type } = this.getImgTypeAndName(uri);
    imgObj.fileName = fileName;
    imgObj.type = type;
    imgObj.id = fileName;
    imgObj.originalPath = uri;
    let file = fs.openSync(uri, fs.OpenMode.CREATE);
    imgObj.fileSize = this.getFileSize(file.fd);
    if (
      pickerMediaType === 'photo' || pickerMediaType === 'mixed' && isPhoto(type)
    ) {
      const { width, height, uri } = await this.getImageSize(file.fd, options, type);
      imgObj.height = height;
      imgObj.width = width;
      imgObj.uri = uri;
    } else {
      imgObj.uri = this.copyFileToCache(file.fd, imgObj.type);
    };
    if (options.includeBase64) {
      imgObj.base64 = await this.getFileBase64(uri);
    };
    fs.closeSync(file);
    return imgObj;
  }

  private async getFileBase64(uri: string) {
    let file = fs.openSync(uri, fs.OpenMode.READ_ONLY);
    let arrayBuffer = new ArrayBuffer(100 * 1024 * 1024);
    let readLen = fs.readSync(file.fd, arrayBuffer);
    return buffer.from(arrayBuffer, 0, readLen).toString('base64');
  }

  private getCacheFilePath(type) {
    return this.ctx.uiAbilityContext.cacheDir + '/rn_image_picker_lib_temp_' + util.generateRandomUUID(true) + '.' + type;
  }


  private copyFileToCache(fd: number, type: string) {
    try {
      let filePath = this.getCacheFilePath(type)
      fs.copyFileSync(fd, filePath, 0)
      return 'file://' + filePath
    } catch (e) {
      Logger.info('复制到应用缓存区失败!', JSON.stringify(e));
    }
  }

  private async getImageSize(fd: number, options: ImageLibraryOptions, type: string) {
    let imageIS = image.createImageSource(fd)
    let imagePM = await imageIS.createPixelMap({editable: true});
    let imgInfo = await imagePM.getImageInfo();
    let width = imgInfo.size.width;
    let height = imgInfo.size.height;
    let xScale = 1;
    let yScale = 1;
    const { maxWidth, maxHeight } = options;
    let isChange = false;
    if (maxWidth && width > maxWidth) {
      xScale = maxWidth / width;
      width = maxWidth;
      isChange = true;
    }
    if (maxHeight && height > maxHeight) {
      yScale = maxHeight / height;
      height = maxHeight;
      isChange = true;
    }
    let uri = this.getCacheFilePath(type);
    if (isChange) {
      try {
        Logger.info(`x, y scale: ${xScale}, ${yScale}`);
        await imagePM.scale(xScale, yScale);
        const imagePackerApi: image.ImagePacker = image.createImagePacker();
        const file = fs.openSync(uri, fs.OpenMode.CREATE | fs.OpenMode.READ_WRITE);
        const buf = await imagePackerApi.packing(imagePM, {format: imgInfo.mimeType, quality: 98});
        await fs.write(file.fd, buf)
        fs.closeSync(file.fd)
      } catch (err) {
        Logger.error(JSON.stringify(err))
      }
    } else {
      uri = this.copyFileToCache(fd, type);
    }

    await imagePM.release();
    imagePM = undefined

    await imageIS.release();
    imageIS = undefined
    return {
      height,
      width,
      uri
    }
  }

  private getFileSize(fd: number) {
    let stat = fs.statSync(fd);
    return stat.size;
  }

  private getImgTypeAndName(imgUri: string) {
    let res = { type: '', fileName: '' } as Pick<Asset, 'type'> & Pick<Asset, 'fileName'>;
    const mimeUri = imgUri.substring(0, 4)
    if (mimeUri === 'file') {
      let i = imgUri.lastIndexOf('/')
      res.fileName = imgUri.substring(i + 1)
      i = imgUri.lastIndexOf('.')
      res.type = 'Unknown'
      if (i != -1) {
        res.type = imgUri.substring(i + 1)
      }
    }
    return res;
  }
}