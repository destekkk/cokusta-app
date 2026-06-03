/** @type {import('expo/config').ExpoConfig} */
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || "https://www.cokusta.com";

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiUrl,
  },
});
