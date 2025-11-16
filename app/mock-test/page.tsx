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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mock Tests</h1>
          <p className="text-gray-600">
            Take full-length mock tests designed as per actual exam patterns
          </p>
        </div>

        {/* Mock Tests Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {mockTests.map((test) => (
            <div key={test.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-5 w-5 text-primary-600" />
                      <span className="text-sm font-semibold text-primary-600 uppercase">
                        {test.examType}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{test.title}</h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{test.description}</p>

                {/* Test Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{test.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{test.totalQuestions} questions</span>
                  </div>
                </div>

                {/* Sections */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Sections:</h4>
                  <div className="space-y-1">
                    {test.sections.map((section, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span className="text-gray-700">{section.name}</span>
                        <span className="text-gray-600">{section.questions} Qs</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(test.id)}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold flex items-center justify-center transition"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Mock Test
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Instructions for Mock Tests
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Make sure you have a stable internet connection before starting</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>The test will auto-submit when time runs out</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You can navigate between questions and mark them for review</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your progress is saved automatically after each answer</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You can view detailed results and solutions after submission</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
