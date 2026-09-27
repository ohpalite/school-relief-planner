const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rawSeedTeachers = [
  {"Name": "Ali", "classes": [{"Level": "P1", "Room": "1 Faith", "Remarks": "Go to 1 Faith."}, {"Level": "P6", "Room": "SBB 6", "Remarks": "Go to SBB 6."}]},
  {"Name": "Amirul", "classes": [{"Level": "P3", "Room": "3 Hope", "Remarks": "Go to 3 Hope."}, {"Level": "P6", "Room": "Comp Lab 3", "Remarks": "Go to Comp Lab 3."}]},
  {"Name": "Aryanti", "classes": [{"Level": "P1", "Room": "1 Joy", "Remarks": "Go to 1 Joy."}, {"Level": "P5", "Room": "SBB3", "Remarks": "Go to SBB3."}]},
  {"Name": "Fatimah", "classes": [{"Level": "P1", "Room": "1 Hope", "Remarks": "Go to 1 Hope."}, {"Level": "P4", "Room": "4 Love", "Remarks": "Go to 4 Love."}, {"Level": "P5", "Room": "SBB4", "Remarks": "Go to SBB4."}]},
  {"Name": "Hidayah", "classes": [{"Level": "P2", "Room": "2 Charity", "Remarks": "Go to 2 Charity."}, {"Level": "P4", "Room": "4 Grace", "Remarks": "Go to 4 Grace."}]},
  {"Name": "Matufa", "classes": [{"Level": "P2", "Room": "2 Joy", "Remarks": "Go to 2 Joy."}, {"Level": "P5", "Room": "5 Joy", "Remarks": "Go to 5 Joy."}]},
  {"Name": "Norashikin", "classes": [{"Level": "P4", "Room": "4 Joy", "Remarks": "Go to 4 Joy."}, {"Level": "P6", "Room": "6 Care", "Remarks": "Go to 6 Care."}]},
  {"Name": "Qamarul", "classes": [{"Level": "P2", "Room": "2 Grace", "Remarks": "Go to 2 Grace."}, {"Level": "P3", "Room": "CCE (EL)", "Remarks": "CCE (EL) students to stay in their form class."}, {"Level": "P5", "Room": "5 Grace", "Remarks": "Go to 5 Grace."}]},
  {"Name": "Zalifah", "classes": [{"Level": "P1", "Room": "1 Hope", "Remarks": "Go to 1 Hope."}, {"Level": "P3", "Room": "3 Joy", "Remarks": "Go to 3 Joy."}, {"Level": "P6", "Room": "6 Faith", "Remarks": "Go to 6 Faith."}]},
  {"Name": "Zulaina", "classes": [{"Level": "P2", "Room": "2 Faith", "Remarks": "Go to 2 Faith."}, {"Level": "P3", "Room": "3 Faith", "Remarks": "Go to 3 Faith."}, {"Level": "P4", "Room": "4 Love", "Remarks": "Go to 4 Love."}]},
  {"Name": "Saras", "classes": [{"Level": "P3", "Room": "Comp Lab 2", "Remarks": "Go to Comp Lab 2."}, {"Level": "P4", "Room": "SBB 8", "Remarks": "Go to SBB 8."}, {"Level": "P5", "Room": "Comp Lab 2", "Remarks": "Go to Comp Lab 2."}]},
  {"Name": "Siti Safura", "classes": [{"Level": "P2", "Room": "Comp Lab 2", "Remarks": "Go to Comp Lab 2."}, {"Level": "P3", "Room": "SBB 4", "Remarks": "Go to SBB 4."}, {"Level": "P4", "Room": "SBB 7", "Remarks": "Go to SBB 7."}, {"Level": "P5", "Room": "5 Care", "Remarks": "Go to 5 Care."}]},
  {"Name": "Syed", "classes": [{"Level": "P3", "Room": "SBB 8", "Remarks": "Go to SBB 8."}, {"Level": "P4", "Room": "Obs Room", "Remarks": "Go to Obs Room."}, {"Level": "P6", "Room": "SBB 7", "Remarks": "Go to SBB 7."}]},
  {"Name": "Thilagah", "classes": [{"Level": "P1", "Room": "SBB 3", "Remarks": "Go to SBB 3."}, {"Level": "P4", "Room": "SBB 7", "Remarks": "Go to SBB 7."}, {"Level": "P6", "Room": "Obs Room", "Remarks": "Go to Obs Room."}]},
  {"Name": "Ping Jun", "classes": [{"Level": "P2", "Room": "CCE (EL)", "Remarks": "CCE (EL) students to stay in their form class."}, {"Level": "P4", "Room": "SBB 6", "Remarks": "Go to SBB 6."}, {"Level": "P6", "Room": "6 Joy", "Remarks": "Go to 6 Joy."}]},
  {"Name": "Chen Qi", "classes": [{"Level": "P1", "Room": "1 Charity", "Remarks": "Go to 1 Charity."}, {"Level": "P4", "Room": "CCE (EL)", "Remarks": "CCE (EL) students to stay in their form class."}, {"Level": "P5", "Room": "SBB 1", "Remarks": "Go to SBB 1."}]},
  {"Name": "Puay San", "classes": [{"Level": "P1", "Room": "1 Care", "Remarks": "Go to 1 Care."}, {"Level": "P4", "Room": "4 Charity", "Remarks": "Go to 4 Charity."}]},
  {"Name": "Shu Bao", "classes": [{"Level": "P2", "Room": "SBB 5", "Remarks": "Go to SBB 5."}, {"Level": "P4", "Room": "4 Hope", "Remarks": "Go to 4 Hope."}]},
  {"Name": "Guan MH", "classes": [{"Level": "P4", "Room": "4 Care", "Remarks": "Go to 4 Care."}, {"Level": "P6", "Room": "6 Hope", "Remarks": "Go to 6 Hope."}]},
  {"Name": "Lau-Leong", "classes": [{"Level": "P2", "Room": "2 Hope", "Remarks": "Go to 2 Hope."}, {"Level": "P5", "Room": "5 Faith", "Remarks": "Go to 5 Faith."}]},
  {"Name": "Linda", "classes": [{"Level": "P3", "Room": "SBB 5", "Remarks": "Go to SBB 5."}, {"Level": "P4", "Room": "4 Faith", "Remarks": "Go to 4 Faith."}, {"Level": "P6", "Room": "SBB 8", "Remarks": "Go to SBB 8."}]},
  {"Name": "Liu Yan", "classes": [{"Level": "P3", "Room": "3 Grace", "Remarks": "Go to 3 Grace."}, {"Level": "P5", "Room": "5 Hope", "Remarks": "Go to 5 Hope."}]},
  {"Name": "Dan Dan", "classes": [{"Level": "P2", "Room": "2 Care", "Remarks": "Go to 2 Care."}, {"Level": "P5", "Room": "CCE (EL)", "Remarks": "CCE (EL) students to stay in their form class."}, {"Level": "P6", "Room": "SBB 2", "Remarks": "Go to SBB 2."}]},
  {"Name": "Chew Hiang", "classes": [{"Level": "P3", "Room": "3 Charity", "Remarks": "Go to 3 Charity."}, {"Level": "P4", "Room": "4 Faith", "Remarks": "Go to 4 Faith."}]},
  {"Name": "Tek Hing", "classes": [{"Level": "P3", "Room": "SBB 3", "Remarks": "Go to SBB 3."}, {"Level": "P5", "Room": "5 Charity", "Remarks": "Go to 5 Charity."}, {"Level": "P6", "Room": "CCE (EL)", "Remarks": "CCE (EL) students to stay in their form class."}]},
  {"Name": "Yee Ying", "classes": [{"Level": "P1", "Room": "CCE (EL)", "Remarks": "CCE (EL) students to stay in their form class."}, {"Level": "P3", "Room": "3 Care", "Remarks": "Go to 3 Care."}, {"Level": "P6", "Room": "6 Grace", "Remarks": "Go to 6 Grace."}]},
  {"Name": "Wei Lin", "classes": [{"Level": "P1", "Room": "1 Grace", "Remarks": "Go to 1 Grace."}, {"Level": "P6", "Room": "6 Charity", "Remarks": "Go to 6 Charity."}]},
  {"Name": "Franklin", "classes": [{"Level": "P6", "Room": "SBB 2", "Remarks": "Go to SBB 2."}]},
  {"Name": "Aainoo", "classes": [{"Level": "P5", "Room": "5 Hope", "Remarks": "Go to 5 Hope."}]},
  {"Name": "Andrea", "classes": [{"Level": "P5", "Room": "SBB 1", "Remarks": "Go to SBB 1."}]},
  {"Name": "Bavani", "classes": [{"Level": "P1", "Room": "1 Grace", "Remarks": "Go to 1 Grace."}]},
  {"Name": "Saravanan", "classes": [{"Level": "P5", "Room": "5 Hope", "Remarks": "Go to 5 Hope."}]},
  {"Name": "Mui Noi", "classes": [{"Level": "P3", "Room": "3 Grace", "Remarks": "Go to 3 Grace."}]},
  {"Name": "Victor", "classes": [{"Level": "P3", "Room": "3 Hope", "Remarks": "Go to 3 Hope."}]},
  {"Name": "Chee Fang", "classes": [{"Level": "P3", "Room": "3 Faith", "Remarks": "Go to 3 Faith."}]},
  {"Name": "Guodong", "classes": [{"Level": "P6", "Room": "6 Grace", "Remarks": "Go to 6 Grace."}]},
  {"Name": "Alex", "classes": [{"Level": "P6", "Room": "Sci Lab", "Remarks": "Go to Sci Lab."}]},
  {"Name": "Sufi", "classes": [{"Level": "P5", "Room": "SBB 1", "Remarks": "Go to SBB 1."}, {"Level": "P6", "Room": "6 Faith", "Remarks": "Go to 6 Faith."}]},
  {"Name": "Kwee Huang", "classes": [{"Level": "P6", "Room": "6 Hope", "Remarks": "Go to 6 Hope."}]},
  {"Name": "Kalai", "classes": [{"Level": "P3", "Room": "3 Joy", "Remarks": "Go to 3 Joy."}, {"Level": "P6", "Room": "6 Hope", "Remarks": "Go to 6 Hope."}]},
  {"Name": "Ling", "classes": [{"Level": "P5", "Room": "Life Sci Room 1", "Remarks": "Go to Life Sci Room 1."}]},
  {"Name": "Shireen", "classes": [{"Level": "P5", "Room": "5 Faith", "Remarks": "Go to 5 Faith."}]},
  {"Name": "Nornizah", "classes": [{"Level": "P6", "Room": "Life Sci Room 1", "Remarks": "Go to Life Sci Room 1."}]}
];

async function main() {
  console.log('Seeding Database...');

  // 1. Settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {
      maxConsecutivePeriodsDay: 6,
      maxTotalPeriodsDay: 9,
      maxReliefPeriodsWeek: 5,
    },
    create: {
      id: 'default',
      maxConsecutivePeriodsDay: 6,
      maxTotalPeriodsDay: 9,
      maxReliefPeriodsWeek: 5,
    },
  });

  // 2. Clear old data
  await prisma.reliefNeed.deleteMany();
  await prisma.specialProgramme.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.teacher.deleteMany();

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const departments = ["English", "Mathematics", "Science", "Mother Tongue", "PE / CCA", "Aesthetics"];

  // 3. Insert Teachers and Timetables
  for (let i = 0; i < rawSeedTeachers.length; i++) {
    const tData = rawSeedTeachers[i];
    const dept = departments[i % departments.length];
    const partTime = i % 8 === 7;

    const teacher = await prisma.teacher.create({
      data: {
        name: tData.Name,
        department: dept,
        partTime: partTime,
      },
    });

    for (let cIdx = 0; cIdx < tData.classes.length; cIdx++) {
      const cls = tData.classes[cIdx];
      const daysForClass = [
        daysOfWeek[(i + cIdx) % daysOfWeek.length],
        daysOfWeek[(i + cIdx + 2) % daysOfWeek.length],
      ];

      for (const day of daysForClass) {
        const periodNum = ((i * 2 + cIdx * 3) % 10) + 1;
        await prisma.timetableEntry.create({
          data: {
            teacherId: teacher.id,
            dayOfWeek: day,
            periodNumber: periodNum,
            activityName: `${cls.Level} Subject`,
            classLevel: cls.Level,
            room: cls.Room,
            venueRemarks: cls.Remarks,
          },
        });

        if (cls.Level === "P5" || cls.Level === "P6" || (i + cIdx) % 2 === 0) {
          if (periodNum < 12) {
            await prisma.timetableEntry.create({
              data: {
                teacherId: teacher.id,
                dayOfWeek: day,
                periodNumber: periodNum + 1,
                activityName: `${cls.Level} Subject`,
                classLevel: cls.Level,
                room: cls.Room,
                venueRemarks: cls.Remarks,
              },
            });
          }
        }
      }
    }
  }

  // 4. Special Programmes & Relief Needs
  const todayStr = new Date().toISOString().split('T')[0];
  const allTeachers = await prisma.teacher.findMany();

  if (allTeachers.length >= 5) {
    await prisma.specialProgramme.create({
      data: {
        teacherId: allTeachers[0].id,
        date: todayStr,
        periodNumber: 6,
        startTime: "10:15",
        endTime: "11:15",
        eventName: "Science Lab Duty / Workshop",
        classLevel: "P5",
      },
    });

    await prisma.specialProgramme.create({
      data: {
        teacherId: allTeachers[1].id,
        date: todayStr,
        periodNumber: 4,
        startTime: "09:15",
        endTime: "09:45",
        eventName: "Staff Briefing",
      },
    });

    const ali = allTeachers.find((t) => t.name === "Ali") || allTeachers[0];
    const fatimah = allTeachers.find((t) => t.name === "Fatimah") || allTeachers[3];
    const amirul = allTeachers.find((t) => t.name === "Amirul") || allTeachers[1];

    await prisma.reliefNeed.create({
      data: {
        absentTeacherId: ali.id,
        date: todayStr,
        periodNumber: 4,
        classLevel: "P6",
        room: "SBB 6",
        status: "Pending",
        finalRemarks: "Go to SBB 6. Pick up from hall at 9:15am. (Mondays Only) Send for recess at 9:45am.",
      },
    });

    await prisma.reliefNeed.create({
      data: {
        absentTeacherId: fatimah.id,
        date: todayStr,
        periodNumber: 5,
        classLevel: "P5",
        room: "SBB4",
        status: "Pending",
        finalRemarks: "Go to SBB4. Pick up from recess at 9:45am.",
      },
    });

    await prisma.reliefNeed.create({
      data: {
        absentTeacherId: ali.id,
        date: todayStr,
        periodNumber: 3,
        classLevel: "P1",
        room: "1 Faith",
        assignedReliefTeacherId: amirul.id,
        status: "Assigned",
        finalRemarks: "Go to 1 Faith.",
      },
    });
  }

  console.log('Database seeded successfully via prisma/seed.js!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
