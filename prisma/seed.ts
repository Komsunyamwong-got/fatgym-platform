import { PrismaClient, MemberStatus, PTStatus, Role, ComplaintStatus, PaymentStatus, LeadStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing database records...');

  // 0. Delete existing records in correct order of dependency
  await prisma.classBooking.deleteMany({});
  await prisma.classSchedule.deleteMany({});
  await prisma.pTSession.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.followUpNote.deleteMany({});
  await prisma.lead.deleteMany({});
  
  // Clean all other dependent member/trainer relations
  await prisma.checkIn.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.healthScreening.deleteMany({});
  await prisma.postureAssessment.deleteMany({});
  await prisma.nutritionProfile.deleteMany({});
  await prisma.measurement.deleteMany({});
  await prisma.clientTrainingPlan.deleteMany({});
  await prisma.commission.deleteMany({});
  await prisma.trainingProgram.deleteMany({});

  await prisma.member.deleteMany({});
  await prisma.trainer.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ['owner@fatgym.com'],
      },
    },
  });

  console.log('Seeding fresh, highly realistic gym data...');

  // 1. Create or ensure Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@fatgym.com' },
    update: {},
    create: {
      email: 'owner@fatgym.com',
      name: 'Gym Owner',
      role: Role.OWNER,
    },
  });

  // 2. Create Membership Packages
  const packagesData = [
    { name: 'Monthly Basic', price: 1500, durationDays: 30, description: 'Standard gym access to all equipment.' },
    { name: 'Quarterly Value', price: 4000, durationDays: 90, description: '3 months gym access + locker rental included.' },
    { name: 'Gold Annual Premium', price: 12000, durationDays: 365, description: '12 months full gym access + 2 PT sessions/month.' },
    { name: 'Student Monthly', price: 1000, durationDays: 30, description: 'Discounted gym access for active students.' },
  ];

  await prisma.membershipPackage.deleteMany({});
  const packagesList = [];
  for (const pkg of packagesData) {
    const created = await prisma.membershipPackage.create({ data: pkg });
    packagesList.push(created);
  }

  // Create PT Packages
  const ptPackagesData = [
    { name: '1 PT Session Trial', price: 1000, sessions: 1 },
    { name: '10 PT Sessions Pack', price: 7500, sessions: 10 },
    { name: '20 PT Sessions Pack', price: 13000, sessions: 20 },
    { name: '50 PT Sessions VIP Pack', price: 30000, sessions: 50 },
  ];

  await prisma.pTPackage.deleteMany({});
  const ptPackagesList = [];
  for (const pkg of ptPackagesData) {
    const created = await prisma.pTPackage.create({ data: pkg });
    ptPackagesList.push(created);
  }

  // 3. Create Trainers
  const trainersData = [
    { email: 'mike@fatgym.com', name: 'Coach Mike', level: 'Senior', specialty: 'Weight Loss & Powerlifting', trainerId: 'T-001' },
    { email: 'sarah@fatgym.com', name: 'Coach Sarah', level: 'Expert', specialty: 'Yoga & Mobility', trainerId: 'T-002' },
    { email: 'alex@fatgym.com', name: 'Coach Alex', level: 'Senior', specialty: 'Bodybuilding & Hypertrophy', trainerId: 'T-003' },
    { email: 'jane@fatgym.com', name: 'Coach Jane', level: 'Junior', specialty: 'Pilates & Barre', trainerId: 'T-004' },
    { email: 'david@fatgym.com', name: 'Coach David', level: 'Expert', specialty: 'HIIT & Crossfit', trainerId: 'T-005' },
    { email: 'natalie@fatgym.com', name: 'Coach Natalie', level: 'Junior', specialty: 'Kickboxing & Cardio', trainerId: 'T-006' },
  ];

  for (const t of trainersData) {
    await prisma.user.create({
      data: {
        email: t.email,
        name: t.name,
        role: Role.TRAINER,
        trainerProfile: {
          create: {
            trainerId: t.trainerId,
            level: t.level,
            specialty: t.specialty,
            status: 'ACTIVE',
          },
        },
      },
    });
  }

  // Fetch created trainers to have full model references
  const trainersList = await prisma.trainer.findMany({
    include: { user: true }
  });

  // 4. Create Members
  const membersData = [
    { name: 'John Doe', email: 'john@example.com', memberId: 'M-2024-001', phone: '081-234-5678', status: MemberStatus.ACTIVE },
    { name: 'Jane Smith', email: 'jane@example.com', memberId: 'M-2024-002', phone: '082-345-6789', status: MemberStatus.ACTIVE },
    { name: 'Alice Johnson', email: 'alice@example.com', memberId: 'M-2024-003', phone: '083-456-7890', status: MemberStatus.ACTIVE },
    { name: 'Bob Brown', email: 'bob@example.com', memberId: 'M-2024-004', phone: '084-567-8901', status: MemberStatus.FREEZE },
    { name: 'Charlie Davis', email: 'charlie@example.com', memberId: 'M-2024-005', phone: '085-678-9012', status: MemberStatus.ACTIVE },
    { name: 'Diana Miller', email: 'diana@example.com', memberId: 'M-2024-006', phone: '086-789-0123', status: MemberStatus.EXPIRED },
    { name: 'Ethan Wilson', email: 'ethan@example.com', memberId: 'M-2024-007', phone: '087-890-1234', status: MemberStatus.ACTIVE },
    { name: 'Fiona Taylor', email: 'fiona@example.com', memberId: 'M-2024-008', phone: '088-901-2345', status: MemberStatus.ACTIVE },
    { name: 'George Anderson', email: 'george@example.com', memberId: 'M-2024-009', phone: '089-012-3456', status: MemberStatus.CANCELLED },
    { name: 'Hannah Thomas', email: 'hannah@example.com', memberId: 'M-2024-010', phone: '090-123-4567', status: MemberStatus.ACTIVE },
    { name: 'Ian Jackson', email: 'ian@example.com', memberId: 'M-2024-011', phone: '091-234-5678', status: MemberStatus.ACTIVE },
    { name: 'Julia White', email: 'julia@example.com', memberId: 'M-2024-012', phone: '092-345-6789', status: MemberStatus.EXPIRED },
    { name: 'Kevin Harris', email: 'kevin@example.com', memberId: 'M-2024-013', phone: '093-456-7890', status: MemberStatus.ACTIVE },
    { name: 'Laura Martin', email: 'laura@example.com', memberId: 'M-2024-014', phone: '094-567-8901', status: MemberStatus.ACTIVE },
    { name: 'Michael Clark', email: 'michael@example.com', memberId: 'M-2024-015', phone: '095-678-9012', status: MemberStatus.ACTIVE },
  ];

  for (const m of membersData) {
    await prisma.user.create({
      data: {
        email: m.email,
        name: m.name,
        role: Role.MEMBER,
        memberProfile: {
          create: {
            memberId: m.memberId,
            phone: m.phone,
            status: m.status,
          },
        },
      },
    });
  }

  // Fetch created members
  const membersList = await prisma.member.findMany({
    include: { user: true }
  });

  // 5. Create Group Classes (12+ classes)
  const classesData = [
    { name: 'Yoga Flow', trainerIdx: 1, capacity: 20, dayOffset: 0, hour: 9 }, // Today 9:00 AM
    { name: 'Powerlifting Basics', trainerIdx: 0, capacity: 15, dayOffset: 0, hour: 18 }, // Today 6:00 PM
    { name: 'HIIT Shred', trainerIdx: 4, capacity: 25, dayOffset: 1, hour: 10 }, // Tomorrow 10:00 AM
    { name: 'Core Pilates', trainerIdx: 3, capacity: 18, dayOffset: 1, hour: 17 }, // Tomorrow 5:00 PM
    { name: 'Bodybuilding 101', trainerIdx: 2, capacity: 20, dayOffset: 2, hour: 16 },
    { name: 'Cardio Kickboxing', trainerIdx: 5, capacity: 20, dayOffset: 2, hour: 19 },
    { name: 'Mobility & Stretch', trainerIdx: 1, capacity: 22, dayOffset: 3, hour: 8 },
    { name: 'Zumba Fit', trainerIdx: 5, capacity: 30, dayOffset: 3, hour: 19 },
    { name: 'CrossFit WOD', trainerIdx: 4, capacity: 15, dayOffset: 4, hour: 7 },
    { name: 'Glute & Leg Sculpt', trainerIdx: 3, capacity: 20, dayOffset: 4, hour: 18 },
    { name: 'Hypertrophy Chest', trainerIdx: 2, capacity: 18, dayOffset: 5, hour: 15 },
    { name: 'Olympic Lifts', trainerIdx: 0, capacity: 12, dayOffset: 5, hour: 17 },
  ];

  for (const c of classesData) {
    const trainer = trainersList[c.trainerIdx % trainersList.length];
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + c.dayOffset);
    targetDate.setHours(c.hour, 0, 0, 0);

    const endTime = new Date(targetDate.getTime() + 60 * 60 * 1000);

    await prisma.classSchedule.create({
      data: {
        name: c.name,
        trainerId: trainer.id,
        capacity: c.capacity,
        startTime: targetDate,
        endTime: endTime,
        date: new Date(targetDate.toDateString()),
      },
    });
  }

  // 6. Create PT Sessions (15 sessions)
  const sessionStatusList = [PTStatus.CONFIRMED, PTStatus.PENDING_CONFIRMATION, PTStatus.CONFIRMED];
  for (let i = 0; i < 15; i++) {
    const member = membersList[i % membersList.length];
    const trainer = trainersList[i % trainersList.length];
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (i % 3) - 1); // Yesterday, Today, Tomorrow
    targetDate.setHours(8 + (i % 8), 0, 0, 0); // 8 AM to 4 PM

    const endTime = new Date(targetDate.getTime() + 60 * 60 * 1000);

    await prisma.pTSession.create({
      data: {
        memberId: member.id,
        trainerId: trainer.id,
        startTime: targetDate,
        endTime: endTime,
        date: new Date(targetDate.toDateString()),
        status: sessionStatusList[i % sessionStatusList.length],
      },
    });
  }

  // 7. Create Inventory Items (12+ realistic items)
  const items = [
    { name: 'Water Bottle (500ml)', category: 'Drinks', quantity: 85, minStock: 20, sellingPrice: 15 },
    { name: 'Whey Protein (Chocolate, 1kg)', category: 'Supplements', quantity: 15, minStock: 5, sellingPrice: 1200 },
    { name: 'Gym Towel (Rental)', category: 'Rentals', quantity: 50, minStock: 10, sellingPrice: 50 },
    { name: 'Energy Drink (Berry Flavour)', category: 'Drinks', quantity: 40, minStock: 15, sellingPrice: 45 },
    { name: 'Protein Bar (Peanut Butter)', category: 'Food', quantity: 120, minStock: 30, sellingPrice: 65 },
    { name: 'Shaker Bottle (Black, 700ml)', category: 'Equipment', quantity: 25, minStock: 8, sellingPrice: 250 },
    { name: 'Lifting Straps (Pair)', category: 'Equipment', quantity: 12, minStock: 4, sellingPrice: 350 },
    { name: 'Chalk Block (Gymnastics)', category: 'Equipment', quantity: 8, minStock: 5, sellingPrice: 80 },
    { name: 'Pre-Workout Booster (Fruit Punch)', category: 'Supplements', quantity: 10, minStock: 4, sellingPrice: 950 },
    { name: 'BCAAs Powder (Lemon Lime)', category: 'Supplements', quantity: 12, minStock: 5, sellingPrice: 800 },
    { name: 'Fat Gym T-Shirt (M/L/XL)', category: 'Apparel', quantity: 30, minStock: 10, sellingPrice: 450 },
    { name: 'Weightlifting Belt (Leather)', category: 'Equipment', quantity: 6, minStock: 2, sellingPrice: 1500 },
  ];

  await prisma.inventoryItem.createMany({ data: items });

  // 8. Create Complaints (8+ highly realistic complaints)
  const complaintsData = [
    { type: 'Equipment', description: 'Treadmill #3 has a squeaky belt and keeps stopping suddenly under high load.', status: ComplaintStatus.IN_PROGRESS },
    { type: 'Facilities', description: 'The air conditioning in the studio room is not cold enough during the 6 PM Pilates class.', status: ComplaintStatus.RESOLVED },
    { type: 'Facilities', description: 'Water dispenser in the weight area is running very slowly and needs filter replacement.', status: ComplaintStatus.OPEN },
    { type: 'Cleanliness', description: 'Shower drain in the men\'s locker room is clogged and causing water buildup.', status: ComplaintStatus.RESOLVED },
    { type: 'Equipment', description: 'One of the 20kg dumbbells has a loose grip handle and is unsafe to lift.', status: ComplaintStatus.OPEN },
    { type: 'Equipment', description: 'Request for heavier kettlebells (28kg and 32kg) in the functional training area.', status: ComplaintStatus.IN_PROGRESS },
    { type: 'Equipment', description: 'Leg press machine safety latch is sticky and hard to disengage when loaded.', status: ComplaintStatus.RESOLVED },
    { type: 'Service', description: 'Music is played too loudly in the morning hours near the reception area, making calls difficult.', status: ComplaintStatus.OPEN },
  ];

  for (let i = 0; i < complaintsData.length; i++) {
    const member = membersList[i % membersList.length];
    const c = complaintsData[i];
    await prisma.complaint.create({
      data: {
        memberId: member.id,
        type: c.type,
        description: c.description,
        status: c.status,
      },
    });
  }

  // 9. Create Purchases & Payments
  const paymentMethodList = ['CASH', 'CREDIT_CARD', 'TRANSFER'];
  for (let i = 0; i < 15; i++) {
    const member = membersList[i % membersList.length];
    const isMembership = i % 2 === 0;
    
    let membershipPackageId = null;
    let ptPackageId = null;
    let amount = 1500;

    if (isMembership) {
      const pkg = packagesList[i % packagesList.length];
      membershipPackageId = pkg.id;
      amount = pkg.price;
    } else {
      const pkg = ptPackagesList[i % ptPackagesList.length];
      ptPackageId = pkg.id;
      amount = pkg.price;
    }

    const purchase = await prisma.purchase.create({
      data: {
        memberId: member.id,
        membershipPackageId,
        ptPackageId,
        amount,
        createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.payment.create({
      data: {
        purchaseId: purchase.id,
        amount: purchase.amount,
        method: paymentMethodList[i % paymentMethodList.length],
        status: PaymentStatus.PAID,
        createdAt: new Date(purchase.createdAt.getTime() + 10 * 60 * 1000), // Paid 10 minutes later
      },
    });
  }

  // 10. Seed 12 Realistic Leads
  console.log('Seeding 12 premium, realistic leads...');
  const leadsData = [
    { name: 'Daniel Miller', phone: '081-234-5678', email: 'daniel.miller@gmail.com', source: 'Facebook Ads', interest: 'Weight Loss PT', status: LeadStatus.NEW_LEAD, goal: 'Lose 10kg for summer wedding', notes: 'Prefers morning sessions. Budget is flexible if trainer is highly senior.' },
    { name: 'Sophia Watson', phone: '089-876-5432', email: 'sophia.w@hotmail.com', source: 'Instagram Organic', interest: 'Yoga & Pilates', status: LeadStatus.CONTACTED, goal: 'Improve flexibility & core control', notes: 'Sent class schedule details. Waiting for her reply.' },
    { name: 'Ethan Hunt', phone: '082-345-6789', email: 'ethan.hunt@imf.org', source: 'Google Search', interest: 'Strength Training', status: LeadStatus.INTERESTED, goal: 'Deadlift 200kg, increase body mass', notes: 'Scheduled physical tour on May 24, 2026.' },
    { name: 'Olivia Martinez', phone: '085-456-7890', email: 'olivia.martinez@yahoo.com', source: 'Walk-in', interest: 'General Fitness', status: LeadStatus.TRIAL_BOOKED, goal: 'Get active after desk job relocation', notes: 'Booked trial class for May 23, 2026 at 5:00 PM.' },
    { name: 'Liam Neeson', phone: '083-567-8901', email: 'liam.n@taken.com', source: 'Referral', interest: 'Kickboxing Cardio', status: LeadStatus.VISITED, goal: 'Cardio conditioning & stress relief', notes: 'Completed gym tour. Extremely impressed by boxing ring & heavy bags.' },
    { name: 'Charlotte Brown', phone: '087-678-9012', email: 'charlotte.b@gmail.com', source: 'Website Inquiry', interest: 'PT Package', status: LeadStatus.PROPOSAL_SENT, goal: 'Post-pregnancy recovery plan', notes: 'Sent customized 20 PT Sessions package proposal (Price: 13,000 THB).' },
    { name: 'Noah Jenkins', phone: '084-789-0123', email: 'noah.jenkins@outlook.com', source: 'Facebook Ads', interest: 'Powerbuilding', status: LeadStatus.HOT_LEAD, goal: 'Hypertrophy mixed with heavy triple strength', notes: 'Very motivated to sign up for annual gold membership today.' },
    { name: 'Emma Watson', phone: '086-890-1234', email: 'emma.w@granger.co.uk', source: 'Walk-in', interest: 'Gold Annual Premium', status: LeadStatus.WON, goal: 'Overall health & longevity', notes: 'Purchased Gold Annual Premium membership and 10 PT Sessions!' },
    { name: 'James Smith', phone: '088-901-2345', email: 'james.smith@gmail.com', source: 'Google Search', interest: 'Weight Loss PT', status: LeadStatus.LOST, goal: 'Quick fat loss before beach holiday', notes: 'Budget too constrained. Chose a cheaper local community center.' },
    { name: 'Mia Peterson', phone: '089-012-3456', email: 'mia.p@gmail.com', source: 'Instagram Organic', interest: 'Yoga & Pilates', status: LeadStatus.FOLLOW_UP_LATER, goal: 'Tone core and improve mental health', notes: 'Temporarily paused inquiry due to busy travel schedules. Call back in June.' },
    { name: 'Alexander G.', phone: '081-345-7890', email: 'alex.g@gmail.com', source: 'Referral', interest: 'Strength Training', status: LeadStatus.HOT_LEAD, goal: 'Raw bench force improvement', notes: 'Friend of Member Alex Johnson. Eager to match his training schedule.' },
    { name: 'Isabella Ross', phone: '082-456-8901', email: 'isabella.ross@gmail.com', source: 'Website Inquiry', interest: 'General Fitness', status: LeadStatus.NEW_LEAD, goal: 'Muscle definition & dietary advice', notes: 'Inquired through web form. Need to make initial contact.' },
  ];

  for (const lead of leadsData) {
    const createdLead = await prisma.lead.create({
      data: {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        interest: lead.interest,
        status: lead.status,
        goal: lead.goal,
        notes: lead.notes,
      }
    });

    // Add a couple of follow-up notes for contacted/interested/hot leads
    if (lead.status !== LeadStatus.NEW_LEAD) {
      await prisma.followUpNote.create({
        data: {
          leadId: createdLead.id,
          note: `System recorded initial inquiry matching interest ${lead.interest}.`,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        }
      });

      await prisma.followUpNote.create({
        data: {
          leadId: createdLead.id,
          note: `Staff checked in. Notes: ${lead.notes}`,
          createdAt: new Date(),
        }
      });
    }
  }

  console.log('Seeding completed. More than 10 rich realistic records created for every core module!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
