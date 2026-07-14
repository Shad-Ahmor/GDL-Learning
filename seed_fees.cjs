const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting fee structure seeding...");

  // Delete all existing fee categories and ledgers
  await prisma.feeLedger.deleteMany({});
  await prisma.feeCategory.deleteMany({});
  
  console.log("Cleared existing fee categories and ledgers.");

  const classes = await prisma.class.findMany({
    orderBy: { orderIndex: 'asc' }
  });

  if (classes.length === 0) {
    console.error("No classes found. Cannot seed fees.");
    return;
  }

  // Create Common Fees
  const commonFees = [
    { name: "Admission Fee", amount: 5000, frequency: "One-Time (Single charge (e.g. Admission))", classIds: null },
    { name: "Registration Fee", amount: 1500, frequency: "One-Time (Single charge (e.g. Admission))", classIds: null },
    { name: "Development Fee", amount: 2000, frequency: "Annual (Full year (12 months))", classIds: null },
  ];

  for (const fee of commonFees) {
    await prisma.feeCategory.create({ data: fee });
  }
  console.log("Created common fees.");

  // Create Class-Specific Fees
  let baseTuition = 1500;
  
  for (const cls of classes) {
    const classIdsStr = JSON.stringify([cls.id]);
    
    // Tuition fee increases as class order increases
    const tuitionAmount = baseTuition + (cls.orderIndex * 200);

    const classFees = [
      { name: "Tuition Fee", amount: tuitionAmount, frequency: "Monthly (One bill per month)", classIds: classIdsStr },
      { name: "Exam Fee", amount: 800 + (cls.orderIndex * 50), frequency: "Half Yearly (6 months at once)", classIds: classIdsStr },
      { name: "Library Fee", amount: 300, frequency: "Quarterly (3 months at once)", classIds: classIdsStr },
      { name: "Sports Fee", amount: 500, frequency: "Annual (Full year (12 months))", classIds: classIdsStr },
      { name: "Activity/Co-curricular", amount: 1000, frequency: "Annual (Full year (12 months))", classIds: classIdsStr },
      { name: "Computer/IT Fee", amount: cls.orderIndex >= 3 ? 1200 : 600, frequency: "Quarterly (3 months at once)", classIds: classIdsStr },
      { name: "Miscellaneous", amount: 200, frequency: "Monthly (One bill per month)", classIds: classIdsStr }
    ];

    for (const fee of classFees) {
      await prisma.feeCategory.create({ data: fee });
    }
    console.log(`Created fees for ${cls.name}`);
  }

  console.log("\nFee structures seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
