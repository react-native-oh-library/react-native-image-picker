#include "RNOH/Package.h"
#include "RNImagePickerTurboModule.h"

using namespace rnoh;
using namespace facebook;
class RNImagePickerFactoryDelegate : public TurboModuleFactoryDelegate
{
public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override
    {
        if (name == "ImagePicker")
        {
            return std::make_shared<RNImagePickerTurboModule>(ctx, name);
        }
        return nullptr;
    };
};
namespace rnoh
{
    class RNImagePickerPackage: public Package
    {
    public:
        RNImagePickerPackage(Package::Context ctx) : Package(ctx) {}
        std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override
        {
            return std::make_unique<RNImagePickerFactoryDelegate>();
        }
    };
} // namespace rnoh