const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getRandomPaymentMode() {
  const modes = ['Cash', 'Bank Transfer', 'UPI', 'Cheque'];
  return modes[Math.floor(Math.random() * modes.length)];
}

async function main() {
  console.log("Starting fee ledgers and payments generation...");

  const activeSession = await prisma.academicSession.findFirst({
    where: { isActive: true }
  });

  if (!activeSession) {
    console.error("No active session found.");
    return;
  }

  // Fetch all students in active session
  const enrollments = await prisma.studentSession.findMany({
    where: { sessionId: activeSession.id, status: 'Active' },
    include: { student: true, class: true }
  });

  const allCategories = await prisma.feeCategory.findMany();

  // Separate common and class-specific categories
  const commonCategories = allCategories.filter(c => !c.classIds || c.classIds === 'null' || c.classIds === '[]');
  
  let totalLedgers = 0;
  let totalReceipts = 0;
  let receiptCounter = 1000;

  console.log(`Generating ledgers for ${enrollments.length} students...`);

  // We will take a sample of 150 students to avoid making the script too slow/heavy, or we can do all 850.
  // Let's do all 850, it shouldn't take more than a few seconds.

  for (const enr of enrollments) {
    const student = enr.student;
    
    // Find applicable categories
    const classCategories = allCategories.filter(c => c.classIds && c.classIds.includes(enr.classId));
    const applicableCategories = [...commonCategories, ...classCategories];

    // Determine payment behavior: 0 = Unpaid, 1 = Partial, 2 = Fully Paid
    const paymentBehavior = Math.floor(Math.random() * 3);

    for (const cat of applicableCategories) {
      // Create a ledger for this category (assuming current month/term)
      let ledger = await prisma.feeLedger.create({
        data: {
          studentId: student.id,
          sessionId: activeSession.id,
          feeCategoryId: cat.id,
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10), // 10th of next month
          amountDue: cat.amount,
          amountPaid: 0,
          status: 'Unpaid'
        }
      });
      totalLedgers++;

      // Make Payments based on behavior
      if (paymentBehavior === 0) {
        // UNPAID - do nothing
      } else if (paymentBehavior === 1) {
        // PARTIAL - pay between 30% and 80%
        const percent = (Math.floor(Math.random() * 50) + 30) / 100;
        const amountToPay = Math.round(cat.amount * percent);
        
        if (amountToPay > 0) {
          await prisma.feeReceipt.create({
            data: {
              receiptNumber: "REC-" + new Date().getFullYear() + "-" + (receiptCounter++),
              ledgerId: ledger.id,
              amount: amountToPay,
              paymentMode: getRandomPaymentMode(),
              paymentDate: new Date()
            }
          });

          await prisma.feeLedger.update({
            where: { id: ledger.id },
            data: {
              amountPaid: amountToPay,
              status: 'Partial'
            }
          });

          // Optional: Add to AccountTransaction
          await prisma.accountTransaction.create({
            data: {
              type: 'Income',
              category: 'Fee Collection',
              amount: amountToPay,
              description: `Partial fee payment for ${student.firstName} - ${cat.name}`,
              referenceNo: `REC-${receiptCounter - 1}`
            }
          });

          totalReceipts++;
        }
      } else if (paymentBehavior === 2) {
        // FULLY PAID
        await prisma.feeReceipt.create({
          data: {
            receiptNumber: "REC-" + new Date().getFullYear() + "-" + (receiptCounter++),
            ledgerId: ledger.id,
            amount: cat.amount,
            paymentMode: getRandomPaymentMode(),
            paymentDate: new Date()
          }
        });

        await prisma.feeLedger.update({
          where: { id: ledger.id },
          data: {
            amountPaid: cat.amount,
            status: 'Paid'
          }
        });

        await prisma.accountTransaction.create({
          data: {
            type: 'Income',
            category: 'Fee Collection',
            amount: cat.amount,
            description: `Full fee payment for ${student.firstName} - ${cat.name}`,
            referenceNo: `REC-${receiptCounter - 1}`
          }
        });

        totalReceipts++;
      }
    }
  }

  console.log(`Done! Created ${totalLedgers} ledgers and ${totalReceipts} receipts across all students.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
