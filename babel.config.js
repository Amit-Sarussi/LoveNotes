module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  // Resolve path aliases for cleaner imports
  plugins.push([
    'module-resolver',
    {
      alias: {
        '@assets': './assets',
        '@components': './components',
        '@utils': './utils'
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
  ]);

  plugins.push('react-native-worklets/plugin');

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
