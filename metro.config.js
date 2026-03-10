const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// lucide-react-native v0.562.0 has a broken `exports` field that points to a
// non-existent ESM file. Override resolution to use the CJS build directly.
const lucideCjsEntry = path.resolve(
  __dirname,
  "node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "lucide-react-native") {
    return { filePath: lucideCjsEntry, type: "sourceFile" };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
