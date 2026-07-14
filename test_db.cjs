const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const session = await prisma.academicSession.create({ data: { name: "Test Session", startDate: new Date(), endDate: new Date(), isActive: true } });
  const cls = await prisma.class.create({ data: { name: "Class 1", sessionId: session.id } });
  const sec = await prisma.section.create({ data: { name: "A", classId: cls.id } });
  console.log({ classId: cls.id, sectionId: sec.id, sessionId: session.id });
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
