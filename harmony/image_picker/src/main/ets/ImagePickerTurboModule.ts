import fs from '@ohos.file.fs';
import image from '@ohos.multimedia.image';
import wantConstant from '@ohos.app.ability.wantConstant';
import uri from '@ohos.uri'
import util from '@ohos.util';
import { TurboModule } from 'rnoh/ts';
import type { TurboModuleContext } from 'rnoh/ts';
import type Want from '@ohos.app.ability.Want';
import Logger from './Logger'


export type MediaType = 'photo' | 'video' | 'mixed';

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


export class ImagePickerTurboModule extends TurboModule {
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  }

  launchCamera(): void {
    Logger.info('launchCamera');
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
    let want = {
      "deviceId": "",
      "bundleName": "",
      "abilityName": "",
      "uri": "",
      "type": "image/*",
      "action": action,
      "parameters": {
        //singleselect multipleselect
        uri: 'multipleselect',
        maxSelectCount: selectionLimit,
        filterMediaType: type == 'photo' ? 'FILTER_MEDIA_TYPE_IMAGE' : (type == 'video' ? 'FILTER_MEDIA_TYPE_VIDEO' : 'FILTER_MEDIA_TYPE_ALL')
      },
      "entities": []
    }
    let result: AbilityResult = await this.ctx.uiAbilityContext.startAbilityForResult(want as Want);
    Logger.info(JSON.stringify(result));
    let images: Array<string> = result.want.parameters['select-item-list'] as Array<string>
    for (let value of images) {
      let imgObj: Asset = {}
      const mimeUri = new uri.URI(value);
      if (mimeUri.scheme === 'file') {
        let i = value.lastIndexOf('/')
        imgObj.fileName = value.substring(i + 1)
        i = value.lastIndexOf('.')
        imgObj.type = 'Unknown'
        if (i != -1) {
          imgObj.type = value.substring(i + 1)
        }
      }
      // console.log(TAG + ',launchImageLibrary,value，' + imgObj.type);
      let file = fs.openSync(value, fs.OpenMode.CREATE)
      let stat = fs.statSync(file.fd);
      imgObj.originalPath = value
      try {
        let filePath = this.ctx.uiAbilityContext.cacheDir + '/rn_image_picker_lib_temp_' + util.generateRandomUUID(true) + '.' + imgObj.type
        fs.copyFileSync(file.fd, filePath, 0)
        imgObj.uri = 'file://' + filePath
      } catch (e) {
        Logger.info('复制到应用缓存区失败!');
        //返回出错数据
        throw e;
      }
      // imgObj.isOriginal = result.want.parameters.isOriginal.valueOf()
      imgObj.fileSize = stat.size;
      if (type === 'photo') {
        let imageIS = image.createImageSource(file.fd)
        let imagePM = await imageIS.createPixelMap()
        let imgInfo = await imagePM.getImageInfo()
        // imagePM.getBytesNumberPerRow()
        imgObj.height = imgInfo.size.width
        imgObj.width = imgInfo.size.height
        imagePM.release()
        imageIS.release()
      }
      fs.closeSync(file);
      results.assets.push(imgObj)
    }
    return results;
  }
}





