const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Node modules resolution — project first, then workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Disable metro's default configuration for symlink support
config.resolver.disableHierarchicalLookup = false;

// Ensure the shared package source is transpilable
config.transformer.enableBabelRCLookup = true;

module.exports = config;