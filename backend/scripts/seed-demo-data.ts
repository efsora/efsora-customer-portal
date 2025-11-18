/**
 * Demo Data Seed Script
 * Populates the database with realistic demo data for the "Your Team" page
 *
 * Usage:
 *   npm run seed:demo
 */

import { db } from "../src/db/client.js";
import {
  companies,
  progressStatus,
  roles,
  projects,
  users,
  milestones,
  events,
} from "../src/db/schema.js";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

const DEMO_PASSWORD = "Demo123!";

async function main() {
  console.log("🌱 Starting demo data seed...\n");

  try {
    // Clear existing data (CASCADE handles dependencies)
    console.log("🧹 Clearing existing data...");
    await db.execute(sql`TRUNCATE TABLE events CASCADE`);
    await db.execute(sql`TRUNCATE TABLE milestones CASCADE`);
    await db.execute(sql`TRUNCATE TABLE projects CASCADE`);
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
    await db.execute(sql`TRUNCATE TABLE session CASCADE`);
    await db.execute(sql`TRUNCATE TABLE companies RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE roles RESTART IDENTITY CASCADE`);
    await db.execute(
      sql`TRUNCATE TABLE progress_status RESTART IDENTITY CASCADE`,
    );
    console.log("✅ Existing data cleared\n");

    // 1. Insert Companies
    console.log("🏢 Seeding companies...");
    const companiesData = await db
      .insert(companies)
      .values([
        {
          name: "Efsora",
          logoUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Efsora",
          adminUserId: null,
        },
        {
          name: "AllSober",
          logoUrl:
            "https://via.placeholder.com/150/00FF00/FFFFFF?text=AllSober",
          adminUserId: null,
        },
        {
          name: "TechCorp",
          logoUrl:
            "https://via.placeholder.com/150/FF0000/FFFFFF?text=TechCorp",
          adminUserId: null,
        },
      ])
      .returning();
    console.log(`✅ Created ${String(companiesData.length)} companies\n`);

    // 2. Insert Progress Statuses
    console.log("📊 Seeding progress statuses...");
    const statusData = await db
      .insert(progressStatus)
      .values([
        { name: "SCHEDULED" },
        { name: "IN_PROGRESS" },
        { name: "WAITING" },
        { name: "INTERNAL_REVIEW" },
        { name: "DELIVERED" },
        { name: "COMPLETED" },
        { name: "REVISION" },
        { name: "BLOCKED" },
      ])
      .returning();
    console.log(`✅ Created ${String(statusData.length)} progress statuses\n`);

    // 3. Insert Roles
    console.log("👥 Seeding roles...");
    const rolesData = await db
      .insert(roles)
      .values([
        { name: "MANAGEMENT" },
        { name: "PRODUCT" },
        { name: "LEGAL" },
        { name: "FINANCE" },
        { name: "DEV" },
        { name: "QA" },
        { name: "AI" },
        { name: "DESIGN" },
        { name: "MARKETING" },
      ])
      .returning();
    console.log(`✅ Created ${String(rolesData.length)} roles\n`);

    // 4. Insert Projects
    console.log("📁 Seeding projects...");
    const projectsData = await db
      .insert(projects)
      .values([
        {
          name: "All Sober Mobile",
          companyId: 2, // AllSober
          status: 3, // WAITING
        },
        {
          name: "Efsora Internal Platform",
          companyId: 1, // Efsora
          status: 2, // IN_PROGRESS
        },
        {
          name: "TechCorp Dashboard",
          companyId: 3, // TechCorp
          status: 1, // SCHEDULED
        },
      ])
      .returning();
    console.log(`✅ Created ${String(projectsData.length)} projects\n`);

    // 5. Insert Users
    console.log("👤 Seeding users...");
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    const usersData = await db
      .insert(users)
      .values([
        // Efsora Team (Company 1)
        {
          name: "Alper",
          surname: "Gayretoğlu",
          email: "alper.gayretoglu@efsora.com",
          password: hashedPassword,
          roleId: 5, // DEV
          bio: "Full-Stack Developer specializing in React and Node.js",
          projectId: 1, // All Sober Mobile
          companyId: 1,
        },
        {
          name: "Emre",
          surname: "Yildiz",
          email: "emre.yildiz@efsora.com",
          password: hashedPassword,
          roleId: 5, // DEV
          bio: "Full-Stack Developer with expertise in TypeScript",
          projectId: 1,
          companyId: 1,
        },
        {
          name: "Ceren",
          surname: "Çınar",
          email: "ceren.cinar@efsora.com",
          password: hashedPassword,
          roleId: 5, // DEV
          bio: "Full-Stack Developer focused on scalable architectures",
          projectId: 1,
          companyId: 1,
        },
        {
          name: "Ibrahim",
          surname: "Acar",
          email: "ibrahim.acar@efsora.com",
          password: hashedPassword,
          roleId: 5, // DEV
          bio: "Full-Stack Developer passionate about clean code",
          projectId: 1,
          companyId: 1,
        },
        {
          name: "Dilay",
          surname: "Ozturk",
          email: "dilay.ozturk@efsora.com",
          password: hashedPassword,
          roleId: 7, // AI
          bio: "AI Developer specializing in machine learning models",
          projectId: 1,
          companyId: 1,
        },
        {
          name: "Ayşe",
          surname: "Kaya",
          email: "ayse.kaya@efsora.com",
          password: hashedPassword,
          roleId: 1, // MANAGEMENT
          bio: "Project Manager with 10+ years experience",
          projectId: 1,
          companyId: 1,
        },
        {
          name: "Mehmet",
          surname: "Demir",
          email: "mehmet.demir@efsora.com",
          password: hashedPassword,
          roleId: 2, // PRODUCT
          bio: "Product Owner focused on user experience",
          projectId: 1,
          companyId: 1,
        },
        {
          name: "Zeynep",
          surname: "Şahin",
          email: "zeynep.sahin@efsora.com",
          password: hashedPassword,
          roleId: 8, // DESIGN
          bio: "UI/UX Designer creating beautiful interfaces",
          projectId: 1,
          companyId: 1,
        },

        // AllSober Team (Company 2)
        {
          name: "James",
          surname: "Anderson",
          email: "james.anderson@allsober.com",
          password: hashedPassword,
          roleId: 5, // DEV
          bio: "Full-Stack Developer with mobile app expertise",
          projectId: 1,
          companyId: 2,
        },
        {
          name: "Sophia",
          surname: "Martinez",
          email: "sophia.martinez@allsober.com",
          password: hashedPassword,
          roleId: 6, // QA
          bio: "QA Engineer ensuring product quality",
          projectId: 1,
          companyId: 2,
        },
        {
          name: "Liam",
          surname: "Walker",
          email: "liam.walker@allsober.com",
          password: hashedPassword,
          roleId: 4, // FINANCE
          bio: "Finance Specialist managing budgets",
          projectId: 1,
          companyId: 2,
        },
        {
          name: "Emma",
          surname: "Thompson",
          email: "emma.thompson@allsober.com",
          password: hashedPassword,
          roleId: 2, // PRODUCT
          bio: "Product Manager driving product vision",
          projectId: 1,
          companyId: 2,
        },
        {
          name: "Noah",
          surname: "Reed",
          email: "noah.reed@allsober.com",
          password: hashedPassword,
          roleId: 3, // LEGAL
          bio: "Legal Consultant ensuring compliance",
          projectId: 1,
          companyId: 2,
        },
        {
          name: "Olivia",
          surname: "Harris",
          email: "olivia.harris@allsober.com",
          password: hashedPassword,
          roleId: 1, // MANAGEMENT
          bio: "CEO and Co-Founder of AllSober",
          projectId: 1,
          companyId: 2,
        },
        {
          name: "Ethan",
          surname: "Clark",
          email: "ethan.clark@allsober.com",
          password: hashedPassword,
          roleId: 9, // MARKETING
          bio: "Marketing Director driving growth",
          projectId: 1,
          companyId: 2,
        },

        // Efsora Team on Internal Platform (Project 2)
        {
          name: "Burak",
          surname: "Yılmaz",
          email: "burak.yilmaz@efsora.com",
          password: hashedPassword,
          roleId: 5, // DEV
          bio: "Backend Developer specializing in microservices",
          projectId: 2,
          companyId: 1,
        },
        {
          name: "Elif",
          surname: "Arslan",
          email: "elif.arslan@efsora.com",
          password: hashedPassword,
          roleId: 6, // QA
          bio: "QA Lead ensuring code quality",
          projectId: 2,
          companyId: 1,
        },

        // TechCorp Team (Company 3)
        {
          name: "Michael",
          surname: "Johnson",
          email: "michael.johnson@techcorp.com",
          password: hashedPassword,
          roleId: 5, // DEV
          bio: "Senior Frontend Developer",
          projectId: 3,
          companyId: 3,
        },
        {
          name: "Sarah",
          surname: "Davis",
          email: "sarah.davis@techcorp.com",
          password: hashedPassword,
          roleId: 2, // PRODUCT
          bio: "Product Manager",
          projectId: 3,
          companyId: 3,
        },
      ])
      .returning();
    console.log(`✅ Created ${String(usersData.length)} users\n`);

    // 6. Insert Milestones (for All Sober Mobile project)
    console.log("🎯 Seeding milestones...");
    const milestonesData = await db
      .insert(milestones)
      .values([
        {
          title: "MVP Release",
          projectId: 1,
          assigneeUserId: usersData.find(
            (u) => u.email === "emma.thompson@allsober.com",
          )?.id,
          status: 2, // IN_PROGRESS
          dueDate: new Date("2025-03-01"),
          description: "Launch minimum viable product for iOS and Android",
        },
        {
          title: "User Authentication",
          projectId: 1,
          assigneeUserId: usersData.find(
            (u) => u.email === "alper.gayretoglu@efsora.com",
          )?.id,
          status: 6, // COMPLETED
          dueDate: new Date("2025-01-15"),
          description: "Implement secure user authentication system",
        },
        {
          title: "Payment Integration",
          projectId: 1,
          assigneeUserId: usersData.find(
            (u) => u.email === "james.anderson@allsober.com",
          )?.id,
          status: 2, // IN_PROGRESS
          dueDate: new Date("2025-02-15"),
          description: "Integrate payment gateway for subscriptions",
        },
        {
          title: "Legal Compliance Review",
          projectId: 1,
          assigneeUserId: usersData.find(
            (u) => u.email === "noah.reed@allsober.com",
          )?.id,
          status: 3, // WAITING
          dueDate: new Date("2025-02-28"),
          description: "Complete legal compliance review for GDPR",
        },
      ])
      .returning();
    console.log(`✅ Created ${String(milestonesData.length)} milestones\n`);

    // 7. Insert Events
    console.log("📅 Seeding events...");
    const eventsData = await db
      .insert(events)
      .values([
        {
          title: "Sprint Planning",
          eventDatetime: new Date("2025-01-20T10:00:00Z"),
          description: "Bi-weekly sprint planning session",
          ownerUserId: usersData.find(
            (u) => u.email === "emma.thompson@allsober.com",
          )?.id,
          milestoneId: milestonesData[0]?.id,
          status: 1, // SCHEDULED
        },
        {
          title: "Architecture Review",
          eventDatetime: new Date("2025-01-22T14:00:00Z"),
          description: "Review technical architecture decisions",
          ownerUserId: usersData.find(
            (u) => u.email === "alper.gayretoglu@efsora.com",
          )?.id,
          milestoneId: milestonesData[0]?.id,
          status: 1, // SCHEDULED
        },
        {
          title: "User Testing Session",
          eventDatetime: new Date("2025-02-01T13:00:00Z"),
          description: "Conduct user testing for MVP features",
          ownerUserId: usersData.find(
            (u) => u.email === "sophia.martinez@allsober.com",
          )?.id,
          milestoneId: milestonesData[0]?.id,
          status: 1, // SCHEDULED
        },
        {
          title: "Stakeholder Demo",
          eventDatetime: new Date("2025-02-10T15:00:00Z"),
          description: "Present progress to stakeholders",
          ownerUserId: usersData.find(
            (u) => u.email === "olivia.harris@allsober.com",
          )?.id,
          milestoneId: milestonesData[0]?.id,
          status: 1, // SCHEDULED
        },
      ])
      .returning();
    console.log(`✅ Created ${String(eventsData.length)} events\n`);

    console.log("=".repeat(60));
    console.log("✅ Demo data seed completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Companies: ${String(companiesData.length)}`);
    console.log(`   - Progress Statuses: ${String(statusData.length)}`);
    console.log(`   - Roles: ${String(rolesData.length)}`);
    console.log(`   - Projects: ${String(projectsData.length)}`);
    console.log(`   - Users: ${String(usersData.length)}`);
    console.log(`   - Milestones: ${String(milestonesData.length)}`);
    console.log(`   - Events: ${String(eventsData.length)}`);
    console.log("\n🔐 Demo Credentials:");
    console.log(`   Email: Any user email from above`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log("\n🎯 Test the Your Team endpoint:");
    console.log("   GET /api/v1/projects/team?projectId=1 (All Sober Mobile)");
    console.log("   - Efsora Team: 8 members");
    console.log("   - AllSober Team: 7 members");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Seed script completed");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });
