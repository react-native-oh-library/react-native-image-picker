#pragma once

#include "RNOH/generated/BaseReactNativeImagePickerPackage.h"

namespace rnoh {

class ImagePickerPackage : public BaseReactNativeImagePickerPackage {
    using Super = BaseReactNativeImagePickerPackage;

public:
    ImagePickerPackage(Package::Context ctx) : Super(ctx) {}
};
} // namespace rnoh