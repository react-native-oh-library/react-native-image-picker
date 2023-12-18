import { Platform } from 'react-native';

import { CameraOptions, ImageLibraryOptions, Callback } from 'react-native-image-picker';
import {
  imageLibrary as nativeImageLibrary,
  camera as nativeCamera,
} from 'react-native-image-picker/src/platforms/native';

import {
  imageLibrary as webImageLibrary,
  camera as webCamera,
} from 'react-native-image-picker/src/platforms/web';

export * from 'react-native-image-picker/src/types';

export function launchCamera(options: CameraOptions, callback?: Callback) {
  return Platform.OS === 'web'
    ? webCamera(options, callback)
    : nativeCamera(options, callback);
}

export function launchImageLibrary(
  options: ImageLibraryOptions,
  callback?: Callback,
) {
  return Platform.OS === 'web'
    ? webImageLibrary(options, callback)
    : nativeImageLibrary(options, callback);
}
