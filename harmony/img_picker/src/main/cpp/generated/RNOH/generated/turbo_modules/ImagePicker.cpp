/**
 * This code was generated by "react-native codegen-lib-harmony"
 */

#include "ImagePicker.h"

namespace rnoh {
using namespace facebook;

ImagePicker::ImagePicker(const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(showImagePicker, 2),
        ARK_METHOD_METADATA(showImagePicker, 1),
        ARK_METHOD_METADATA(launchCamera, 2),
        ARK_METHOD_METADATA(launchCamera, 1),
        ARK_METHOD_METADATA(launchImageLibrary, 2),
        ARK_METHOD_METADATA(launchImageLibrary, 1),
        ARK_METHOD_METADATA(canRecordVideos, 0),
        ARK_METHOD_METADATA(canUseCamera, 0),
        ARK_METHOD_METADATA(openCameraDialog, 0),
        ARK_METHOD_METADATA(openSelectDialog, 0),
    };
}

} // namespace rnoh
