import { prisma } from '../config/prisma.js';

export async function seedDatabaseIfEmpty() {
  try {
    // 1. Ensure School Record
    let school = await prisma.school.findFirst();
    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Essani Children Academy',
          administrator: 'Muhammad Arsalan Qasim',
          phone: '0332 2454401',
          address: 'Opp Umar Shadi Hall, Shoe Market, Garden West, Karachi'
        }
      });
    }

    // 2. Ensure Single Owner Admin User
    let user = await prisma.user.findUnique({
      where: { email: 'arsalan.qasim@essani.edu.pk' }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'arsalan.qasim@essani.edu.pk',
          password: 'admin',
          name: 'Muhammad Arsalan Qasim',
          title: 'Administrator / Owner',
          phone: '0332 2454401',
          schoolId: school.id
        }
      });
    }

    // 3. Ensure Academic Systems (Matriculation & O-Levels)
    await prisma.academicSystem.upsert({
      where: { code: 'MATRIC' },
      update: {},
      create: {
        name: 'Matriculation',
        code: 'MATRIC',
        description: 'Nursery to Class 10 (Matriculation Board)',
        schoolId: school.id
      }
    });

    await prisma.academicSystem.upsert({
      where: { code: 'OLEVEL' },
      update: {},
      create: {
        name: 'O-Levels',
        code: 'OLEVEL',
        description: 'Grade 6 to O-3 (Cambridge GCE System)',
        schoolId: school.id
      }
    });

    console.log('Core system initialized for Essani Children Academy (Matriculation & O-Levels). Clean slate ready for user input.');
  } catch (error) {
    console.warn('System initialization note:', error);
  }
}
