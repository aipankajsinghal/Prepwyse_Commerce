"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Clock, FileText, Play, Trophy, AlertCircle, Sparkles, Plus, X } from "lucide-react";

interface MockTestSection {
  name: string;
  questions: number;
}

interface MockTest {
  id: string;
  title: string;
  examType: string;
  description?: string;
  duration: number;
  totalQuestions: number;
  sections: MockTestSection[];
}

export default function MockTestPage() {
  const router = useRouter();
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingTest, setStartingTest] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Fetch mock tests from API
  useEffect(() => {
    const fetchMockTests = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/mock-tests");
        
        if (!response.ok) {
          throw new Error("Failed to fetch mock tests");
        }
        
        const data = await response.json();
        setMockTests(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Error fetching mock tests:", errorMessage);
        setError("Failed to load mock tests. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchMockTests();
  }, []);

  const handleStartTest = async (testId: string) => {
    try {
      setStartingTest(testId);
      setError("");

      const response = await fetch(`/api/mock-tests/${testId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start mock test");
      }

      const data = await response.json();
      
      // Navigate to mock test attempt page (placeholder for now)
      // In a full implementation, this would go to /mock-test/[attemptId]
      alert(`Mock test started successfully!\n\nAttempt ID: ${data.attemptId}\n\nNote: Mock test taking interface is not yet implemented. This functionality will redirect to a test-taking page in a complete implementation.`);
      
      // TODO: Uncomment when mock test taking page is implemented
      // router.push(`/mock-test/${data.attemptId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start mock test. Please try again.";
      console.error("Error starting mock test:", errorMessage);
      setError(errorMessage);
    } finally {
      setStartingTest(null);
    }
  };

  const handleGenerateAIMockTest = async (params: {
    title: string;
    examType: string;
    description: string;
    duration: number;
    totalQuestions: number;
    sections: MockTestSection[];
  }) => {
    try {
      setGeneratingAI(true);
      setError("");

      const response = await fetch("/api/ai/generate-mock-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate AI mock test");
      }

      const data = await response.json();
      
      // Add the new mock test to the list
      setMockTests(prev => [data.mockTest, ...prev]);
      setShowAIGenerator(false);
      
      // Show success message
      alert(`✨ AI Mock Test Generated Successfully!\n\n${data.message}\nQuestions Generated: ${data.questionsGenerated}\n\nThe mock test has been added to your list.`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate AI mock test. Please try again.";
      console.error("Error generating AI mock test:", errorMessage);
      setError(errorMessage);
    } finally {
      setGeneratingAI(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-accent-1 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-text-secondary font-body">Loading mock tests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-reveal">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary mb-2">Mock Tests</h1>
              <p className="font-body text-text-secondary">
                Take full-length mock tests designed as per actual exam patterns
              </p>
            </div>
            <button
              onClick={() => setShowAIGenerator(true)}
              className="btn-primary flex items-center"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Generate AI Mock Test
            </button>
          </div>
        </div>

        {/* AI Generator Modal */}
        {showAIGenerator && (
          <AIGeneratorModal
            onGenerate={handleGenerateAIMockTest}
            onClose={() => setShowAIGenerator(false)}
            isGenerating={generatingAI}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200 text-sm font-body">{error}</p>
          </div>
        )}

        {mockTests.length === 0 ? (
          <div className="edu-card text-center py-12">
            <Trophy className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
              No Mock Tests Available
            </h3>
            <p className="text-text-secondary font-body mb-4">
              Mock tests need to be created by an administrator.
            </p>
            <p className="text-sm text-text-muted font-body">
              Contact your administrator to create mock tests for your grade level.
            </p>
          </div>
        ) : (
          <>
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
                        <h3 className="text-xl font-display font-bold text-text-primary break-words">{test.title}</h3>
                      </div>
                    </div>

                    {test.description && (
                      <p className="font-body text-text-secondary mb-4 break-words">{test.description}</p>
                    )}

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
                    {test.sections && test.sections.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-display font-semibold text-text-primary mb-2">Sections:</h4>
                        <div className="space-y-1">
                          {test.sections.map((section, sectionIndex) => (
                            <div
                              key={sectionIndex}
                              className="flex justify-between text-sm font-body bg-accent-2/5 p-2 rounded"
                            >
                              <span className="text-text-primary">{section.name}</span>
                              <span className="text-text-secondary">{section.questions} Qs</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleStartTest(test.id)}
                      disabled={startingTest === test.id}
                      className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {startingTest === test.id ? (
                        <>
                          <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start Mock Test
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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

// AI Generator Modal Component
interface AIGeneratorModalProps {
  onGenerate: (params: {
    title: string;
    examType: string;
    description: string;
    duration: number;
    totalQuestions: number;
    sections: MockTestSection[];
  }) => void;
  onClose: () => void;
  isGenerating: boolean;
}

function AIGeneratorModal({ onGenerate, onClose, isGenerating }: AIGeneratorModalProps) {
  const [title, setTitle] = useState("");
  const [examType, setExamType] = useState("CUET");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(120);
  const [sections, setSections] = useState<MockTestSection[]>([
    { name: "Business Studies", questions: 40 },
    { name: "Accountancy", questions: 30 },
    { name: "Economics", questions: 30 },
  ]);

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      title,
      examType,
      description,
      duration,
      totalQuestions,
      sections,
    });
  };

  const updateSection = (index: number, field: 'name' | 'questions', value: string | number) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { name: "", questions: 10 }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-accent-1/10 rounded-full flex items-center justify-center mr-3">
                <Sparkles className="h-6 w-6 text-accent-1" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  Generate AI Mock Test
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI will create questions for your custom mock test
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CUET Commerce Full Mock Test"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-1"
              />
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exam Type *
              </label>
              <select
                required
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-1"
              >
                <option value="CUET">CUET Commerce</option>
                <option value="Class 12">Class 12</option>
                <option value="Class 11">Class 11</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the mock test..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-1"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                required
                min="30"
                max="300"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-1"
              />
            </div>

            {/* Sections */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sections *
                </label>
                <button
                  type="button"
                  onClick={addSection}
                  className="text-sm text-accent-1 hover:text-accent-1-dark flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </button>
              </div>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={section.name}
                      onChange={(e) => updateSection(index, 'name', e.target.value)}
                      placeholder="Section name"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="number"
                      required
                      min="1"
                      value={section.questions}
                      onChange={(e) => updateSection(index, 'questions', Number(e.target.value))}
                      placeholder="Questions"
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(index)}
                        className="px-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Total Questions: {totalQuestions}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isGenerating || !title || totalQuestions === 0}
                className="flex-1 px-6 py-3 bg-accent-1 text-white rounded-lg hover:bg-accent-1-dark transition font-medium font-display disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Mock Test
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium font-display disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
