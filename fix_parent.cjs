// Script to fix any orphaned parents or missing connections
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking student parent connections...");
  const students = await prisma.student.findMany({ include: { parent: true } });
  let fixed = 0;
  for (const stu of students) {
    if (!stu.parentId || !stu.parent) {
       console.log(`Student ${stu.firstName} ${stu.lastName} has no parent record.`);
    }
  }
  console.log("Done checking.");
}

main().finally(() => prisma.$disconnect());
