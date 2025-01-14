'use strict';

import ImagePickerManager from './NativeImgPicker';

const DEFAULT_OPTIONS = {
  title: 'Select a Photo',
  cancelButtonTitle: 'Cancel',
  takePhotoButtonTitle: 'Take Photo…',
  chooseFromLibraryButtonTitle: 'Choose from Library…',
  quality: 1.0,
  allowsEditing: false,
  permissionDenied: {
    title: 'Permission denied',
    text: 'To be able to take pictures with your camera and choose images from your library.',
    reTryTitle: 're-try',
    okTitle: "I'm sure",
  },
};

module.exports = {
  /**
   * react-native-image-picker
   */
  launchCamera: ImagePickerManager.launchCamera,
  launchImageLibrary: ImagePickerManager.launchImageLibrary,
  showImagePicker: function showImagePicker(options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    return ImagePickerManager.showImagePicker({ ...DEFAULT_OPTIONS, ...options }, callback);
  },

  /**
   * RN0.61 imagepickerios
   */
  canRecordVideos: ImagePickerManager.canRecordVideos,
  canUseCamera: ImagePickerManager.canUseCamera,
  openCameraDialog: ImagePickerManager.openCameraDialog,
  openSelectDialog: ImagePickerManager.openSelectDialog,
};
