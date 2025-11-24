"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ThemeSelector from "@/components/ThemeSelector";
import {
  User,
  Mail,
  Award,
  Calendar,
  TrendingUp,
  BookOpen,
  Trophy,
  Target,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ProfilePageWithAuth() {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setGrade(user.publicMetadata?.grade as string || "");
      setBio(user.publicMetadata?.bio as string || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      // Use API route to update profile data
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          grade, 
          bio 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Reload user to get updated data
      await user.reload();
      
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      
      // Check if this is first-time profile setup (redirected from FirstLoginProfilePrompt)
      const isFirstTimeSetup = !user.publicMetadata?.profilePromptDismissed && grade;
      
      if (isFirstTimeSetup) {
        // Redirect to dashboard after brief delay
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        // Just show success message for regular profile updates
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError("Failed to update profile. Please try again.");
      console.error("Profile update error:", err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    { label: "Quizzes Taken", value: "45", icon: BookOpen, color: "blue" },
    { label: "Mock Tests", value: "12", icon: Trophy, color: "yellow" },
    { label: "Average Score", value: "87%", icon: Target, color: "green" },
    { label: "Study Streak", value: "15 days", icon: TrendingUp, color: "purple" },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-display font-bold text-primary dark:text-white">My Profile</h1>
            <ThemeSelector />
          </div>
          <p className="font-body text-text-secondary dark:text-gray-300">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full border-4 border-blue-100 dark:border-blue-900"
                  />
                  <div className="absolute bottom-0 right-0 bg-semantic-success-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800" />
                </div>

                <h2 className="text-2xl font-display font-bold text-primary dark:text-white mb-2">
                  {user.fullName || user.firstName || "Student"}
                </h2>
                
                <div className="flex items-center justify-center font-body text-text-secondary dark:text-gray-300 mb-4">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{user.primaryEmailAddress?.emailAddress}</span>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Level 5 Learner
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-4 text-left">
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-sm">
                        {success}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grade/Class
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Grade</option>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                        <option value="CUET">CUET Preparation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-accent-1 text-white rounded-lg hover:bg-accent-1-dark transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setError("");
                          setSuccess("");
                        }}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-left space-y-3 mb-6">
                      <div className="flex items-center font-body text-text-secondary dark:text-gray-300">
                        <User className="h-4 w-4 mr-2" />
                        <span>{firstName} {lastName}</span>
                      </div>
                      {grade ? (
                        <div className="flex items-center font-body text-text-secondary dark:text-gray-300">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span>{grade === "CUET" ? "CUET Preparation" : `Class ${grade}`}</span>
                        </div>
                      ) : (
                        <div className="flex items-center font-body text-text-muted dark:text-gray-500 italic">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span>Grade not set</span>
                        </div>
                      )}
                      {bio ? (
                        <p className="text-sm font-body text-text-secondary dark:text-gray-300 italic">
                          &ldquo;{bio}&rdquo;
                        </p>
                      ) : (
                        <p className="text-sm font-body text-text-muted dark:text-gray-500 italic">
                          No bio added yet
                        </p>
                      )}
                      <div className="flex items-center font-body text-text-secondary dark:text-gray-300">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          Joined {new Date(user.createdAt!).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 font-semibold"
                    >
                      <Edit2 className="h-5 w-5" />
                      <span>Edit Profile</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats & Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Stats Grid */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Your Statistics
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`h-12 w-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                      <span className="text-3xl font-display font-bold text-primary dark:text-white">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm font-medium font-body text-text-secondary dark:text-gray-300">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="space-y-4">
                  {[
                    {
                      title: "Completed Business Studies Quiz",
                      score: "92%",
                      date: "2 hours ago",
                      icon: BookOpen,
                    },
                    {
                      title: "Finished CUET Mock Test",
                      score: "85%",
                      date: "Yesterday",
                      icon: Trophy,
                    },
                    {
                      title: "Accountancy Practice Session",
                      score: "88%",
                      date: "2 days ago",
                      icon: Target,
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-accent-1-100 dark:bg-accent-1-900/30 rounded-lg flex items-center justify-center">
                          <activity.icon className="h-5 w-5 text-accent-1 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {activity.title}
                          </p>
                          <p className="text-sm font-body text-text-secondary dark:text-gray-400">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-semantic-success dark:text-green-400">
                          {activity.score}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Achievements
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { title: "First Quiz", icon: "🎯", unlocked: true },
                  { title: "Week Streak", icon: "🔥", unlocked: true },
                  { title: "Top Scorer", icon: "🏆", unlocked: false },
                  { title: "100 Quizzes", icon: "💯", unlocked: false },
                  { title: "Perfect Score", icon: "⭐", unlocked: true },
                  { title: "Mock Master", icon: "🎓", unlocked: false },
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border-2 ${
                      achievement.unlocked
                        ? "border-yellow-400 dark:border-yellow-600"
                        : "border-gray-200 dark:border-gray-700 opacity-50"
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {achievement.title}
                    </p>
                    {achievement.unlocked && (
                      <p className="text-xs text-semantic-success dark:text-green-400 mt-1">
                        Unlocked
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  if (!hasClerkKey) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-primary dark:text-white mb-2">Authentication unavailable</h1>
          <p className="font-body text-text-secondary dark:text-gray-300">
            Provide NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable the profile experience.
          </p>
        </div>
      </div>
    );
  }

  return <ProfilePageWithAuth />;
}
