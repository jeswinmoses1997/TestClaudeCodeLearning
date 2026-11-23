import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);
const origin = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: { baseURL: origin, viewport: { width: 1536, height: 864 } },
  webServer: {
    command: `npm run build && npx next start -p ${port}`,
    url: `${origin}/tier-list`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
