import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function patchSaturdays() {
  try {
    console.log('Connecting to database to patch Saturdays...');
    
    // Find all subjects that are currently assigned to Mon-Fri only
    const subjectsToUpdate = await prisma.subject.findMany({
      where: {
        daysOfWeek: 'Mon,Tue,Wed,Thu,Fri'
      }
    });

    console.log(`Found ${subjectsToUpdate.length} subjects to update.`);

    if (subjectsToUpdate.length > 0) {
      const updateResult = await prisma.subject.updateMany({
        where: {
          daysOfWeek: 'Mon,Tue,Wed,Thu,Fri'
        },
        data: {
          daysOfWeek: 'Mon,Tue,Wed,Thu,Fri,Sat'
        }
      });
      console.log(`Successfully updated ${updateResult.count} subjects to include Saturday.`);
    } else {
      console.log('No subjects needed patching, or they already include Saturday or "All Days".');
    }
  } catch (error) {
    console.error('Error updating subjects:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database disconnected.');
  }
}

patchSaturdays();
