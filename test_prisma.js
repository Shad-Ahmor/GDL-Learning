import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const class1 = await prisma.class.findFirst();
    const sec1 = await prisma.section.findFirst();
    const newStudent = await prisma.student.create({
      data: {
        admissionNumber: "ADM-2026-897",
        firstName: "stu1",
        lastName: "l",
        gender: "Male",
        mobileNumber: "+91 9233455443",
        dob: new Date("1999-01-01"),
        admissionDate: new Date("2026-06-20"),
        classId: class1.id,
        sectionId: sec1.id,
        parent: {
          create: { fatherName: "father stu1", motherName: "mother stu1", primaryPhone: "+91 3243324433" }
        }
      },
      include: { class: true, section: true, parent: true }
    });
    console.log("Success:", newStudent);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
