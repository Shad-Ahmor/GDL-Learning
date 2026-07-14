const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // connects to dev.db

async function cleanTenantDbs() {
  const files = fs.readdirSync('prisma').filter(f => f.startsWith('tenant_') && f.endsWith('.db'));
  for (const file of files) {
    const dbPath = path.join(process.cwd(), 'prisma', file);
    const newPrisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });
    
    console.log('Cleaning', file);
    const tablesToWipe = ['User', 'ClientToken', 'License'];
    await newPrisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
    for (const table of tablesToWipe) {
      try { await newPrisma.$executeRawUnsafe(`DELETE FROM "${table}"`); } catch (e) {}
    }
    try { await newPrisma.$executeRawUnsafe(`DELETE FROM "Role" WHERE "name" = 'Super Admin'`); } catch (e) {}
    
    // Attempt to figure out tenant email from filename hex
    try {
      const hex = file.replace('tenant_', '').replace('.db', '');
      const email = Buffer.from(hex, 'hex').toString('utf8');
      const token = await prisma.clientToken.findUnique({ where: { email } });
      if (token && token.schoolName) {
        await newPrisma.$executeRawUnsafe(`DELETE FROM "WhiteLabelConfig"`);
        await newPrisma.whiteLabelConfig.create({
          data: { schoolName: token.schoolName, themeColor: '#4F46E5' }
        });
      }
    } catch(e) {}
    
    await newPrisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
  }
}
cleanTenantDbs().then(() => console.log('Done')).catch(console.error);
