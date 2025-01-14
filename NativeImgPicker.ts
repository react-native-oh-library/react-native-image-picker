
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';


export type CustomButtonOptions = {
    name?: string;
    title?: string;
}

export type StorageOptions = {
    skipBackup?: boolean;
    path?: string;
    cameraRoll?: boolean;
    waitUntilSaved?: boolean;
}

export type Options = {
    title?: string;
    cancelButtonTitle?: string;
    takePhotoButtonTitle?: string;
    chooseFromLibraryButtonTitle?: string;
    customButtons?: Array<CustomButtonOptions>;
    cameraType?: 'front' | 'back';
    mediaType?: 'photo' | 'video' | 'mixed';
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    videoQuality?: 'low' | 'medium' | 'high';
    durationLimit?: number;
    rotation?: number;
    allowsEditing?: boolean;
    noData?: boolean;
    storageOptions?: StorageOptions;
}


export type Response = {
    customButton: string;
    didCancel: boolean;
    error: string;
    data: string;
    uri: string;
    origURL?: string;
    isVertical: boolean;
    width: number;
    height: number;
    fileSize: number;
    type?: string;
    fileName?: string;
    path?: string;
    latitude?: number;
    longitude?: number;
    timestamp?: string;
}

export interface Spec extends TurboModule {
    /**
     * react-native-image-picker
     */
    showImagePicker(options: Options, callback: (response: Response) => void): void;
    showImagePicker(callback: (response: Response) => void): void;

    launchCamera(options: Options, callback: (response: Response) => void): void;
    launchCamera(callback: (response: Response) => void): void;
    
    launchImageLibrary(options: Options, callback: (response: Response) => void): void;
    launchImageLibrary(callback: (response: Response) => void): void;

    /**
     * RN0.61 imagepickerios
     */
    canRecordVideos(): void
    canUseCamera(): void
    openCameraDialog(): void
    openSelectDialog(): void

}

export default TurboModuleRegistry.getEnforcing<Spec>('ImagePicker');
