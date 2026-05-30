/** PM2 — sunucuda: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "cokusta",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
