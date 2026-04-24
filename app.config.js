const buildNumber = process.env.EAS_BUILD_IOS_BUILD_NUMBER || '1';

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: 'Love Notes',
    slug: 'love-notes',
    scheme: 'love-notes',
    version: '1.2.0',
    web: {
      favicon: './assets/favicon.png',
    },
    experiments: {
      tsconfigPaths: true,
    },
    updates: {
      url: 'https://u.expo.dev/036f72d5-5ff9-4062-92fc-8c5f4f655526',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-asset',
      'expo-notifications',
      '@bacons/apple-targets',
    ],
    orientation: 'portrait',
    icon: './assets/icon.png',
    backgroundColor: '#000000',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#171717',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'me.amitsarussi.lovenotesapp',
      buildNumber,
      entitlements: {
        'com.apple.security.application-groups': ['group.me.amitsarussi.lovenotesapp'],
      },
      backgroundColor: '#000000',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIDeviceFamily: [1],
      },
      appleTeamId: '3GH53UV4WP',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#171717',
      },
      package: 'me.amitsarussi.lovenotesapp',
    },
    extra: {
      router: {},
      eas: {
        projectId: '036f72d5-5ff9-4062-92fc-8c5f4f655526',
        build: {
          experimental: {
            ios: {
              appExtensions: [
                {
                  bundleIdentifier: 'me.amitsarussi.lovenotesapp.widget',
                  targetName: 'widget',
                  entitlements: {
                    'com.apple.security.application-groups': ['group.me.amitsarussi.lovenotesapp'],
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
};
