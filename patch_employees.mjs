import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function patchDatabase() {
  console.log("Patching existing employees to link them to the oldest active session...");
  
  // Find all employees
  const employees = await prisma.employee.findMany({ include: { sessions: true } });
  console.log(`Found ${employees.length} employees.`);
  
  // Find all sessions
  const sessions = await prisma.academicSession.findMany({ orderBy: { startDate: 'asc' } });
  if (sessions.length === 0) {
    console.log("No sessions found. Aborting.");
    return;
  }
  
  // We link unlinked employees to the first (oldest) session
  const targetSession = sessions[0];
  
  for (const emp of employees) {
    if (emp.sessions.length === 0) {
      console.log(`Linking employee ${emp.firstName} ${emp.lastName} to session ${targetSession.name}`);
      await prisma.employeeSession.create({
        data: {
          employeeId: emp.id,
          sessionId: targetSession.id,
          status: 'Active'
        }
      });
    }
  }
  
  console.log("Patch complete.");
  await prisma.$disconnect();
}

patchDatabase();
