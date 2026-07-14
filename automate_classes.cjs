const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  const activeSession = await prisma.academicSession.findFirst({where: {isActive: true}});
  if (!activeSession) return console.log("No active session");
  
  const classes = await prisma.class.findMany({ 
    where: { sessionId: activeSession.id },
    include: { sections: true } 
  });
  
  const masterSubjects = await prisma.masterSubject.findMany({ where: { sessionId: activeSession.id } });
  const employees = await prisma.employee.findMany();
  
  let schoolConfig = {};
  try {
    const configPath = path.join(process.cwd(), 'config', 'school.json');
    if (fs.existsSync(configPath)) {
      schoolConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch(e) {}

  if (!schoolConfig.schoolStartTime) schoolConfig.schoolStartTime = "08:00";
  if (!schoolConfig.schoolEndTime) schoolConfig.schoolEndTime = "14:00";
  if (!schoolConfig.lunchStartTime) schoolConfig.lunchStartTime = "11:00";
  if (!schoolConfig.lunchEndTime) schoolConfig.lunchEndTime = "11:30";
  if (!schoolConfig.periodDuration) schoolConfig.periodDuration = 45;

  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const format24h = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const startMins = parseTime(schoolConfig.schoolStartTime);
  const endMins = parseTime(schoolConfig.schoolEndTime);
  const lunchStart = parseTime(schoolConfig.lunchStartTime);
  const lunchEnd = parseTime(schoolConfig.lunchEndTime);
  const duration = parseInt(schoolConfig.periodDuration) || 45;

  const periods = [];
  let currentMins = startMins;

  while (currentMins + duration <= endMins) {
    const pStart = currentMins;
    const pEnd = currentMins + duration;

    if (lunchStart > 0 && lunchEnd > 0) {
      if ((pStart < lunchEnd && pEnd > lunchStart)) {
        currentMins = lunchEnd;
        continue;
      }
    }

    periods.push({
      startTime: format24h(pStart),
      endTime: format24h(pEnd)
    });
    
    currentMins += duration;
    if (periods.length >= 8) break;
  }

  // FIX: Use exact casing matching the UI ('Mon', 'Tue', etc.)
  const daysOfWeek = "Mon,Tue,Wed,Thu,Fri,Sat";

  let createdCount = 0;

  for (const cls of classes) {
    const level = parseInt(cls.name.replace(/\D/g, '') || '1');
    for (const sec of cls.sections) {
      await prisma.subject.deleteMany({
        where: { classId: cls.id, sectionId: sec.id }
      });

      for (let i = 0; i < Math.min(8, periods.length); i++) {
        const period = periods[i];
        
        const subjectPool = masterSubjects.filter(ms => !['Lunch', 'Assembly'].includes(ms.name));
        if (subjectPool.length === 0) continue;
        
        const ms = subjectPool[(level + i) % subjectPool.length];
        
        if (!ms) continue;
        
        let teacher = employees.find(e => e.designation && e.designation.toLowerCase().includes(ms.name.toLowerCase()));
        if (!teacher) {
            teacher = employees[(level + i) % employees.length];
        }

        if (ms && teacher) {
          await prisma.subject.create({
            data: {
              classId: cls.id,
              sectionId: sec.id,
              masterSubjectId: ms.id,
              teacherId: teacher.id,
              startTime: period.startTime,
              endTime: period.endTime,
              daysOfWeek: daysOfWeek,
              isOptional: false
            }
          });
          createdCount++;
        }
      }
    }
  }

  console.log(`Successfully created ${createdCount} subject plans with correct days casing!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
