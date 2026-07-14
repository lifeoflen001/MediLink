const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block jsonwebtoken temp directories (created/deleted during pnpm install, not needed by mobile)
const { BlockList } = require('node:module');
config.resolver = config.resolver ?? {};
const existingBlock = config.resolver.blockList;
config.resolver.blockList = [
  ...(existingBlock ? (Array.isArray(existingBlock) ? existingBlock : [existingBlock]) : []),
  /node_modules\/.pnpm\/jsonwebtoken[^/]*\/node_modules\/jsonwebtoken_tmp.*/,
  /node_modules\/jsonwebtoken_tmp.*/,
];

module.exports = config;
