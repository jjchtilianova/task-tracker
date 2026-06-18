import "dotenv/config";
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const url = rawUrl.startsWith("file:.")
  ? "file:" + path.resolve(process.cwd(), rawUrl.replace(/^file:/, "")).replace(/\\/g, "/")
  : rawUrl;
const authToken = process.env.DATABASE_AUTH_TOKEN;
const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.workstream.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.task.deleteMany();

  const workstreams = await Promise.all([
    prisma.workstream.create({ data: { name: "Engineering" } }),
    prisma.workstream.create({ data: { name: "Design" } }),
    prisma.workstream.create({ data: { name: "Marketing" } }),
    prisma.workstream.create({ data: { name: "Product" } }),
    prisma.workstream.create({ data: { name: "QA" } }),
  ]);

  const members = await Promise.all([
    prisma.teamMember.create({ data: { name: "Alex Chen", email: "alex@example.com", color: "#6366f1" } }),
    prisma.teamMember.create({ data: { name: "Priya Sharma", email: "priya@example.com", color: "#ec4899" } }),
    prisma.teamMember.create({ data: { name: "Marcus Lee", email: "marcus@example.com", color: "#14b8a6" } }),
    prisma.teamMember.create({ data: { name: "Sofia Ruiz", email: "sofia@example.com", color: "#f59e0b" } }),
    prisma.teamMember.create({ data: { name: "Jordan Kim", email: "jordan@example.com", color: "#8b5cf6" } }),
  ]);

  const now = new Date();
  const past = (d: number) => new Date(now.getTime() - d * 86400000);
  const future = (d: number) => new Date(now.getTime() + d * 86400000);

  await Promise.all([
    prisma.task.create({
      data: {
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing and deployment",
        assignees: JSON.stringify([members[0].name, members[2].name]),
        workstream: workstreams[0].name,
        priority: "High",
        startDate: past(10),
        completionDate: past(2),
        completed: true,
      },
    }),
    prisma.task.create({
      data: {
        title: "Design system tokens",
        description: "Define color, spacing, and typography tokens in Figma",
        assignees: JSON.stringify([members[1].name]),
        workstream: workstreams[1].name,
        priority: "Medium",
        startDate: past(7),
        completionDate: future(3),
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: "Q3 campaign brief",
        description: "Draft messaging strategy for the Q3 product launch campaign",
        assignees: JSON.stringify([members[3].name]),
        workstream: workstreams[2].name,
        priority: "High",
        startDate: past(14),
        completionDate: past(3),
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: "User research interviews",
        description: "Conduct 5 interviews with power users about the dashboard experience",
        assignees: JSON.stringify([members[4].name, members[1].name]),
        workstream: workstreams[3].name,
        priority: "High",
        startDate: past(5),
        completionDate: future(5),
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: "API rate limiting",
        description: "Implement per-user rate limiting on all public endpoints",
        assignees: JSON.stringify([members[0].name]),
        workstream: workstreams[0].name,
        priority: "Medium",
        startDate: past(3),
        completionDate: future(7),
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: "Mobile responsive audit",
        description: "Review all pages on iOS Safari and Android Chrome; document issues",
        assignees: JSON.stringify([members[2].name]),
        workstream: workstreams[4].name,
        priority: "Medium",
        startDate: past(1),
        completionDate: future(4),
        completed: false,
      },
    }),
    prisma.task.create({
      data: {
        title: "Onboarding flow redesign",
        description: "Reduce steps from 7 to 4 and add progress indicator",
        assignees: JSON.stringify([members[1].name, members[4].name]),
        workstream: workstreams[1].name,
        priority: "High",
        startDate: past(6),
        completionDate: past(1),
        completed: true,
      },
    }),
    prisma.task.create({
      data: {
        title: "Pricing page copy update",
        description: "Refresh value props and add enterprise tier description",
        assignees: JSON.stringify([members[3].name]),
        workstream: workstreams[2].name,
        priority: "Low",
        startDate: future(1),
        completionDate: future(10),
        completed: false,
      },
    }),
  ]);

  console.log("✓ Seed complete");
  console.log(`  ${workstreams.length} workstreams, ${members.length} members, 8 tasks`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
