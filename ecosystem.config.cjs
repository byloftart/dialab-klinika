module.exports = {
  apps: [
    {
      name: "dialab",
      cwd: "/home/iram/apps/dialab",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
