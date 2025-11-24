import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const subjectCount = await prisma.subject.count();
    console.log(`Subject count: ${subjectCount}`);
    
    if (subjectCount > 0) {
      const subjects = await prisma.subject.findMany();
      console.log('Subjects:', JSON.stringify(subjects, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
