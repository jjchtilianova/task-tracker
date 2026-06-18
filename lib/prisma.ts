import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolveDbUrl(rawUrl: string): string {
  if (!rawUrl.startsWith("file:.")) return rawUrl;
  const abs = path.resolve(process.cwd(), rawUrl.replace(/^file:/, ""));
  return "file:" + abs.replace(/\\/g, "/");
}

function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const url = resolveDbUrl(rawUrl);
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
