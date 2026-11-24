const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Migrações do Drizzle são arquivos .sql importados pelo bundle.
config.resolver.sourceExts.push('sql');

module.exports = config;
