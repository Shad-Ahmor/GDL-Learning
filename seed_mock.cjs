const { PrismaClient } = require('@prisma/client');
const path = require('path');

const tenantId = process.argv[2] || 'abc@gmail.com';
const sanitizedTenant = Buffer.from(tenantId).toString('hex');
const dbPath = path.join(process.cwd(), 'prisma', `tenant_${sanitizedTenant}.db`);

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } }
});

async function seed() {
  console.log('Seeding mock data for:', dbPath);

  // Clear existing to avoid unique constraint errors
  await prisma.feeReceipt.deleteMany();
  await prisma.feeLedger.deleteMany();
  await prisma.feeCategory.deleteMany();
  await prisma.studentAttendance.deleteMany();
  await prisma.studentSession.deleteMany();
  await prisma.student.deleteMany();
  await prisma.employeeSession.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicSession.deleteMany();

  // 1. Create a Session and Term
  const session = await prisma.academicSession.create({
    data: {
      name: '2024-2025',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      isActive: true
    }
  });

  const term = await prisma.term.create({
    data: { name: 'Term 1', sessionId: session.id }
  });

  // 2. Create Classes & Sections
  const class10 = await prisma.class.create({
    data: { name: 'Class 10', sessionId: session.id }
  });
  const secA = await prisma.section.create({
    data: { name: 'A', classId: class10.id }
  });

  // 3. Create Students (large amount for nice numbers)
  const students = [];
  for (let i = 1; i <= 284; i++) { // Let's add 284 students, and we'll multiply in UI or just use 284
    const student = await prisma.student.create({
      data: {
        admissionNumber: `ADM-2024-${1000 + i}`,
        firstName: `Student ${i}`,
        lastName: `Mock ${i}`,
        dob: new Date('2008-05-10'),
        gender: i % 2 === 0 ? 'Female' : 'Male',
        admissionDate: new Date('2024-04-05'),
        status: 'Active',
      }
    });
    
    await prisma.studentSession.create({
      data: {
        studentId: student.id,
        sessionId: session.id,
        classId: class10.id,
        sectionId: secA.id,
        rollNumber: `${i}`,
        status: 'Active'
      }
    });
    students.push(student);
  }

  // 4. Create Fee Data
  const tuitionFee = await prisma.feeCategory.create({
    data: { name: 'Tuition Fee', amount: 50000, frequency: 'Yearly' }
  });

  for (const st of students) {
    const isPaid = Math.random() > 0.3; 
    const ledger = await prisma.feeLedger.create({
      data: {
        studentId: st.id,
        sessionId: session.id,
        feeCategoryId: tuitionFee.id,
        dueDate: new Date(),
        amountDue: 50000,
        amountPaid: isPaid ? 50000 : 20000,
        status: isPaid ? 'Paid' : 'Partial'
      }
    });

    if (ledger.amountPaid > 0) {
      await prisma.feeReceipt.create({
        data: {
          receiptNumber: `REC-${Math.floor(Math.random() * 1000000)}`,
          ledgerId: ledger.id,
          amount: ledger.amountPaid,
          paymentMode: 'Online',
          paymentDate: new Date()
        }
      });
    }
  }

  // 5. Create Attendance
  const today = new Date();
  for (let d = 0; d < 7; d++) {
    const attDate = new Date(today);
    attDate.setDate(today.getDate() - d);
    
    for (const st of students) {
      const isPresent = Math.random() > 0.1; 
      await prisma.studentAttendance.create({
        data: {
          studentId: st.id,
          sessionId: session.id,
          date: attDate,
          status: isPresent ? 'Present' : 'Absent'
        }
      });
    }
  }

  // 6. Employees
  for (let i = 1; i <= 148; i++) {
    await prisma.employee.create({
      data: {
        employeeId: `EMP-${1000 + i}`,
        firstName: `Teacher ${i}`,
        lastName: `Mock ${i}`,
        designation: 'Senior Teacher',
        department: 'Academic',
        joinDate: new Date('2020-01-15'),
        dob: new Date('1985-05-20'),
        gender: i % 2 === 0 ? 'Female' : 'Male',
        mobileNumber: `987654321${i}`,
        baseSalary: 45000
      }
    });
  }

  console.log('Seeding complete for', tenantId);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
