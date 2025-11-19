/**
 * Prisma Configuration
 * Migrated from package.json#prisma as recommended for Prisma 7
 * @see https://pris.ly/prisma-config
 */

import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "ts-node --compiler-options {\\\"module\\\":\\\"CommonJS\\\"} prisma/seed.ts"
  },
});
