import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create Subjects
  const businessStudies = await prisma.subject.upsert({
    where: { name: "Business Studies" },
    update: {},
    create: {
      name: "Business Studies",
      description: "Core commerce subject covering business management and organization",
      icon: "briefcase",
    },
  });

  const accountancy = await prisma.subject.upsert({
    where: { name: "Accountancy" },
    update: {},
    create: {
      name: "Accountancy",
      description: "Financial accounting and analysis",
      icon: "calculator",
    },
  });

  const economics = await prisma.subject.upsert({
    where: { name: "Economics" },
    update: {},
    create: {
      name: "Economics",
      description: "Micro and macro economics",
      icon: "trending-up",
    },
  });

  console.log("Subjects created");

  // Create Chapters for Business Studies
  const bsChapters = [
    { name: "Nature and Significance of Management", order: 1 },
    { name: "Principles of Management", order: 2 },
    { name: "Business Environment", order: 3 },
    { name: "Planning", order: 4 },
    { name: "Organizing", order: 5 },
    { name: "Staffing", order: 6 },
    { name: "Directing", order: 7 },
    { name: "Controlling", order: 8 },
  ];

  for (const chapter of bsChapters) {
    await prisma.chapter.upsert({
      where: {
        subjectId_name: {
          subjectId: businessStudies.id,
          name: chapter.name,
        },
      },
      update: {},
      create: {
        name: chapter.name,
        subjectId: businessStudies.id,
        order: chapter.order,
        description: `Chapter on ${chapter.name}`,
      },
    });
  }

  // Create Chapters for Accountancy
  const accChapters = [
    { name: "Accounting for Partnership Firms", order: 1 },
    { name: "Admission of a Partner", order: 2 },
    { name: "Retirement/Death of a Partner", order: 3 },
    { name: "Dissolution of Partnership Firm", order: 4 },
    { name: "Accounting for Share Capital", order: 5 },
    { name: "Issue and Redemption of Debentures", order: 6 },
    { name: "Financial Statements of a Company", order: 7 },
  ];

  for (const chapter of accChapters) {
    await prisma.chapter.upsert({
      where: {
        subjectId_name: {
          subjectId: accountancy.id,
          name: chapter.name,
        },
      },
      update: {},
      create: {
        name: chapter.name,
        subjectId: accountancy.id,
        order: chapter.order,
        description: `Chapter on ${chapter.name}`,
      },
    });
  }

  // Create Chapters for Economics
  const ecoChapters = [
    { name: "Introduction to Microeconomics", order: 1 },
    { name: "Theory of Consumer Behaviour", order: 2 },
    { name: "Production and Costs", order: 3 },
    { name: "The Theory of the Firm", order: 4 },
    { name: "Market Equilibrium", order: 5 },
    { name: "National Income Accounting", order: 6 },
    { name: "Money and Banking", order: 7 },
    { name: "Government Budget", order: 8 },
  ];

  for (const chapter of ecoChapters) {
    await prisma.chapter.upsert({
      where: {
        subjectId_name: {
          subjectId: economics.id,
          name: chapter.name,
        },
      },
      update: {},
      create: {
        name: chapter.name,
        subjectId: economics.id,
        order: chapter.order,
        description: `Chapter on ${chapter.name}`,
      },
    });
  }

  console.log("Chapters created");

  // Create sample questions for Business Studies - Chapter 1
  const bsChapter1 = await prisma.chapter.findFirst({
    where: {
      subjectId: businessStudies.id,
      name: "Nature and Significance of Management",
    },
  });

  if (bsChapter1) {
    const sampleQuestions = [
      {
        questionText: "What is the primary objective of management?",
        options: JSON.stringify([
          "Maximizing profits",
          "Achieving organizational goals efficiently",
          "Reducing costs",
          "Increasing market share",
        ]),
        correctAnswer: "Achieving organizational goals efficiently",
        explanation:
          "Management aims to achieve organizational goals in an efficient and effective manner.",
        difficulty: "easy",
      },
      {
        questionText: "Which of the following is NOT a level of management?",
        options: JSON.stringify([
          "Top Management",
          "Middle Management",
          "Lower Management",
          "External Management",
        ]),
        correctAnswer: "External Management",
        explanation:
          "The three levels of management are top, middle, and lower management.",
        difficulty: "easy",
      },
      {
        questionText: "Management is considered as:",
        options: JSON.stringify([
          "Only an art",
          "Only a science",
          "Both an art and a science",
          "Neither art nor science",
        ]),
        correctAnswer: "Both an art and a science",
        explanation:
          "Management involves both systematic knowledge (science) and personal skills (art).",
        difficulty: "medium",
      },
    ];

    for (const q of sampleQuestions) {
      await prisma.question.create({
        data: {
          chapterId: bsChapter1.id,
          ...q,
        },
      });
    }
  }

  console.log("Sample questions created");

  // Create Mock Tests
  const cuetMockTest = await prisma.mockTest.create({
    data: {
      title: "CUET Commerce Full Mock Test 1",
      description: "Complete mock test based on CUET Commerce exam pattern",
      examType: "CUET",
      totalQuestions: 100,
      duration: 120,
      sections: JSON.stringify([
        { name: "Business Studies", questions: 40, subjectId: businessStudies.id },
        { name: "Accountancy", questions: 30, subjectId: accountancy.id },
        { name: "Economics", questions: 30, subjectId: economics.id },
      ]),
    },
  });

  const class12MockTest = await prisma.mockTest.create({
    data: {
      title: "Class 12 Term Mock Test",
      description: "Mock test covering all Class 12 Commerce subjects",
      examType: "Class 12",
      totalQuestions: 80,
      duration: 180,
      sections: JSON.stringify([
        { name: "Business Studies", questions: 30, subjectId: businessStudies.id },
        { name: "Accountancy", questions: 30, subjectId: accountancy.id },
        { name: "Economics", questions: 20, subjectId: economics.id },
      ]),
    },
  });

  console.log("Mock tests created");

  // Phase C: Create Subscription Plans
  console.log("Creating subscription plans...");

  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "basic" },
    update: {},
    create: {
      name: "basic",
      displayName: "Basic Plan",
      description: "Perfect for students starting their CUET Commerce preparation",
      price: 299.00,
      durationDays: 30,
      features: JSON.stringify([
        "Unlimited quizzes",
        "AI-generated questions",
        "Basic performance analytics",
        "Subject-wise practice",
        "Mobile access",
        "Email support"
      ]),
      isActive: true,
      order: 1,
    },
  });

  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "premium" },
    update: {},
    create: {
      name: "premium",
      displayName: "Premium Plan",
      description: "Most popular! Complete preparation toolkit with advanced features",
      price: 499.00,
      durationDays: 30,
      features: JSON.stringify([
        "Everything in Basic",
        "Full-length mock tests",
        "AI study planner",
        "Smart flashcards with spaced repetition",
        "Advanced analytics & insights",
        "Personalized recommendations",
        "Gamification with leaderboards",
        "Priority email support",
        "Ad-free experience"
      ]),
      isActive: true,
      order: 2,
    },
  });

  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "pro" },
    update: {},
    create: {
      name: "pro",
      displayName: "Pro Plan (3 Months)",
      description: "Best value! Extended access for serious exam preparation",
      price: 1199.00,
      durationDays: 90,
      features: JSON.stringify([
        "Everything in Premium",
        "3 months unlimited access",
        "Exclusive video lessons (coming soon)",
        "Live doubt resolution sessions (coming soon)",
        "Previous year papers with solutions",
        "Downloadable study materials",
        "Performance prediction AI",
        "24/7 priority support",
        "Certificate of completion"
      ]),
      isActive: true,
      order: 3,
    },
  });

  const annualPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "annual" },
    update: {},
    create: {
      name: "annual",
      displayName: "Annual Plan",
      description: "Maximum savings! Full year access with all premium features",
      price: 3999.00,
      durationDays: 365,
      features: JSON.stringify([
        "Everything in Pro",
        "Full year unlimited access",
        "Maximum cost savings (67% off monthly rate)",
        "All future feature updates included",
        "Lifetime access to study materials",
        "Priority feature requests",
        "Dedicated account manager",
        "Early access to new features",
        "One-on-one mentorship sessions (quarterly)"
      ]),
      isActive: true,
      order: 4,
    },
  });

  console.log("Subscription plans created:", {
    basic: basicPlan.name,
    premium: premiumPlan.name,
    pro: proPlan.name,
    annual: annualPlan.name,
  });

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
