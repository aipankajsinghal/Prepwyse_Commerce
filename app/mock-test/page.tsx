"use client";

import Navbar from "@/components/Navbar";
import { Clock, FileText, Play, Trophy } from "lucide-react";

// Mock data for different exam types
const mockTests = [
  {
    id: "1",
    title: "CUET Commerce Full Mock Test 1",
    examType: "CUET",
    description: "Complete mock test based on CUET Commerce exam pattern",
    duration: 120,
    totalQuestions: 100,
    sections: [
      { name: "Business Studies", questions: 40 },
      { name: "Accountancy", questions: 30 },
      { name: "Economics", questions: 30 },
    ],
  },
  {
    id: "2",
    title: "Class 12 Term Mock Test",
    examType: "Class 12",
    description: "Mock test covering all Class 12 Commerce subjects",
    duration: 180,
    totalQuestions: 80,
    sections: [
      { name: "Business Studies", questions: 30 },
      { name: "Accountancy", questions: 30 },
      { name: "Economics", questions: 20 },
    ],
  },
  {
    id: "3",
    title: "Class 11 Comprehensive Test",
    examType: "Class 11",
    description: "Full syllabus test for Class 11 Commerce students",
    duration: 150,
    totalQuestions: 75,
    sections: [
      { name: "Business Studies", questions: 25 },
      { name: "Accountancy", questions: 30 },
      { name: "Economics", questions: 20 },
    ],
  },
];

export default function MockTestPage() {
  const handleStartTest = (testId: string) => {
    // In production, this would navigate to the test taking page
    alert(`Starting mock test ${testId}`);
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-reveal">
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Mock Tests</h1>
          <p className="font-body text-text-secondary">
            Take full-length mock tests designed as per actual exam patterns
          </p>
        </div>

        {/* Mock Tests Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {mockTests.map((test, index) => (
            <div key={test.id} className={`edu-card animate-reveal delay-${(index + 1) * 100}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-5 w-5 text-accent-1" />
                      <span className="text-sm font-display font-semibold text-accent-1 uppercase">
                        {test.examType}
                      </span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-text-primary">{test.title}</h3>
                  </div>
                </div>

                <p className="font-body text-text-secondary mb-4">{test.description}</p>

                {/* Test Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <Clock className="h-4 w-4 text-accent-2" />
                    <span className="text-sm font-body">{test.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-text-secondary">
                    <FileText className="h-4 w-4 text-accent-2" />
                    <span className="text-sm font-body">{test.totalQuestions} questions</span>
                  </div>
                </div>

                {/* Sections */}
                <div className="mb-4">
                  <h4 className="text-sm font-display font-semibold text-text-primary mb-2">Sections:</h4>
                  <div className="space-y-1">
                    {test.sections.map((section, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm font-body bg-accent-2/5 p-2 rounded"
                      >
                        <span className="text-text-primary">{section.name}</span>
                        <span className="text-text-secondary">{section.questions} Qs</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(test.id)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Mock Test
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions Card */}
        <div className="edu-card bg-gradient-to-br from-accent-2/10 to-accent-1/10 border-2 border-accent-2/20">
          <h2 className="text-xl font-display font-bold text-primary mb-4">
            Instructions for Mock Tests
          </h2>
          <ul className="space-y-2 font-body text-text-secondary">
            <li className="flex items-start">
              <span className="mr-2 text-accent-1">•</span>
              <span>Make sure you have a stable internet connection before starting</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-accent-1">•</span>
              <span>The test will auto-submit when time runs out</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-accent-1">•</span>
              <span>You can navigate between questions and mark them for review</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-accent-1">•</span>
              <span>Your progress is saved automatically after each answer</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-accent-1">•</span>
              <span>You can view detailed results and solutions after submission</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
