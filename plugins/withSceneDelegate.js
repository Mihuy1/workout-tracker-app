// iOS 27 asserts at launch unless the app adopts the UIScene life cycle.
// Expo SDK 57 ships `ExpoAppSceneDelegate` for this, but the prebuild template
// doesn't use it yet, so wire it up here.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const withSceneManifest = (config) =>
  withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: 'EXExpoAppSceneDelegate',
          },
        ],
      },
    };
    return config;
  });

const withSceneAppDelegate = (config) =>
  withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    // The scene delegate reads the factory and window through this protocol.
    contents = contents.replace(
      /class AppDelegate: ExpoAppDelegate \{/,
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
    );

    // The scene delegate creates the window and starts React Native instead.
    contents = contents.replace(
      /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\([\s\S]*?\)\n#endif\n/,
      '\n'
    );

    if (!contents.includes('ExpoReactNativeFactoryProvider {') || contents.includes('UIScreen.main.bounds')) {
      throw new Error('withSceneDelegate: AppDelegate.swift template changed; update the plugin.');
    }

    config.modResults.contents = contents;
    return config;
  });

module.exports = (config) => withSceneAppDelegate(withSceneManifest(config));
