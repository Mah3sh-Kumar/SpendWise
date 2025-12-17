const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable bundle splitting and optimization
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Enable advanced minification
    mangle: {
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_keys: true,
      wrap_iife: true,
    },
    sourceMap: false,
    toplevel: false,
    warnings: false,
    parse: {},
    compress: {
      drop_console: true, // Remove console.log statements
      drop_debugger: true,
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
  },
};

// Optimize resolver for smaller bundles
config.resolver = {
  ...config.resolver,
  alias: {
    // Use lighter alternatives where possible
    'react-native-vector-icons': '@expo/vector-icons',
  },
};

module.exports = config;