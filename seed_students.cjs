const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const firstNames = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharva", "Kabir", "Rishi", "Rudra", "Aryan", "Ananya", "Diya", "Suhana", "Kriti", "Riya", "Aadhya", "Saanvi", "Myra", "Pari", "Navya", "Kiara", "Avni", "Mahi", "Zara", "Tara"];
const lastNames = ["Sharma", "Verma", "Singh", "Kumar", "Gupta", "Mishra", "Patel", "Reddy", "Joshi", "Bansal", "Yadav", "Tiwari", "Das", "Roy", "Nair"];
const maleParents = ["Rajesh", "Suresh", "Ramesh", "Mukesh", "Vijay", "Ajay", "Sanjay", "Anil", "Sunil", "Amit", "Sumit", "Deepak", "Prakash", "Pramod"];
const femaleParents = ["Sunita", "Anita", "Kavita", "Sita", "Geeta", "Neeta", "Pooja", "Aarti", "Rekha", "Sushma", "Usha", "Mamta", "Lata", "Asha"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPhone() {
  return "9" + Math.floor(100000000 + Math.random() * 900000000).toString();
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("Starting student seeding process...");
  
  const activeSession = await prisma.academicSession.findFirst({
    where: { isActive: true }
  });

  if (!activeSession) {
    console.error("No active session found!");
    return;
  }

  const classes = await prisma.class.findMany({
    where: { sessionId: activeSession.id },
    include: { sections: true }
  });

  let totalStudentsCreated = 0;
  let admissionCounter = 1000;

  for (const cls of classes) {
    for (const sec of cls.sections) {
      const studentCount = Math.floor(Math.random() * 11) + 30; // 30 to 40
      
      console.log(`Adding ${studentCount} students to Class ${cls.name} Section ${sec.name}...`);
      
      for (let i = 0; i < studentCount; i++) {
        const fatherName = getRandom(maleParents) + " " + getRandom(lastNames);
        const motherName = getRandom(femaleParents) + " " + getRandom(lastNames);
        const parentPhone = getRandomPhone();
        
        const parentRecord = await prisma.parent.create({
          data: {
            fatherName,
            motherName,
            primaryPhone: "+91 " + parentPhone,
            email: "parent" + admissionCounter + "@example.com"
          }
        });

        const firstName = getRandom(firstNames);
        const lastName = getRandom(lastNames);
        const dob = getRandomDate(new Date(2010, 0, 1), new Date(2018, 0, 1));
        const gender = firstNames.indexOf(firstName) < 15 ? "Male" : "Female";
        
        const student = await prisma.student.create({
          data: {
            admissionNumber: "ADM-" + admissionCounter++,
            firstName,
            lastName,
            dob,
            gender,
            admissionDate: new Date(),
            mobileNumber: "+91 " + getRandomPhone(),
            email: firstName.toLowerCase() + admissionCounter + "@example.com",
            parentId: parentRecord.id,
            status: 'Active'
          }
        });

        await prisma.studentSession.create({
          data: {
            studentId: student.id,
            sessionId: activeSession.id,
            classId: cls.id,
            sectionId: sec.id,
            status: 'Active',
            rollNumber: (i + 1).toString()
          }
        });
        
        totalStudentsCreated++;
      }
    }
  }

  console.log(`\nSuccessfully created ${totalStudentsCreated} students with parent details across all sections!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
