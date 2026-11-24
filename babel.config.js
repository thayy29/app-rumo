module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Embute os arquivos .sql das migrações do Drizzle no bundle.
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
