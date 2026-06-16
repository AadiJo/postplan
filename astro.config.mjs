import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import clerk from "@clerk/astro";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [
    clerk({
      signInForceRedirectUrl: "/",
      signUpForceRedirectUrl: "/",
      afterSignOutUrl: "/",
    }),
  ],
});
