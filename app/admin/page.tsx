"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Settings,
  Shield,
  Database,
  Activity,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function AdminPanelWithAuth() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.publicMetadata?.role === "admin" || user?.primaryEmailAddress?.emailAddress?.includes("admin");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-primary dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="font-body text-text-secondary dark:text-gray-300 mb-6">
            You don&apos;t have permission to access the admin panel
          </p>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-accent-1-600 text-white rounded-lg hover:bg-accent-1-700 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: BookOpen },
    { id: "questions", label: "Questions", icon: FileText },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    { label: "Total Users", value: "10,234", change: "+12%", icon: Users, color: "blue" },
    { label: "Active Quizzes", value: "1,456", change: "+8%", icon: FileText, color: "green" },
    { label: "Questions", value: "50,128", change: "+15%", icon: Database, color: "purple" },
    { label: "Avg. Completion", value: "87%", change: "+3%", icon: TrendingUp, color: "yellow" },
  ];

  const recentUsers = [
    { id: 1, name: "Rahul Kumar", email: "rahul@example.com", grade: "12", joined: "2 hours ago", status: "active" },
    { id: 2, name: "Priya Sharma", email: "priya@example.com", grade: "11", joined: "5 hours ago", status: "active" },
    { id: 3, name: "Amit Patel", email: "amit@example.com", grade: "CUET", joined: "1 day ago", status: "active" },
    { id: 4, name: "Sneha Gupta", email: "sneha@example.com", grade: "12", joined: "2 days ago", status: "inactive" },
  ];

  const recentQuestions = [
    { id: 1, text: "What is the basic objective of financial management?", subject: "Business Studies", chapter: "Financial Management", difficulty: "Medium" },
    { id: 2, text: "Define depreciation in accounting.", subject: "Accountancy", chapter: "Depreciation", difficulty: "Easy" },
    { id: 3, text: "Explain the concept of elasticity of demand.", subject: "Economics", chapter: "Demand", difficulty: "Hard" },
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
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-accent-1" />
            <h1 className="text-3xl font-display font-bold text-primary dark:text-white">Admin Panel</h1>
          </div>
          <p className="font-body text-text-secondary dark:text-gray-300">
            Manage users, content, and platform settings
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                    activeTab === tab.id
                      ? "bg-accent-1-600 text-white"
                      : "font-body text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <span className="text-sm font-semibold text-semantic-success dark:text-green-400">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm font-body text-text-secondary dark:text-gray-300 mb-1">{stat.label}</p>
                  <p className="text-3xl font-display font-bold text-primary dark:text-white">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recent Users
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Joined
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {user.grade}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {user.joined}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recent Questions
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                  {recentQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        {question.text}
                      </p>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="px-2 py-1 bg-accent-1-100 dark:bg-accent-1-900 text-blue-700 dark:text-blue-300 rounded">
                          {question.subject}
                        </span>
                        <span className="font-body text-text-secondary dark:text-gray-400">{question.chapter}</span>
                        <span className={`px-2 py-1 rounded ${
                          question.difficulty === "Easy"
                            ? "bg-semantic-success-100 text-green-700 dark:bg-semantic-success-900 dark:text-green-300"
                            : question.difficulty === "Medium"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  User Management
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {user.grade}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.status === "active"
                              ? "bg-semantic-success-100 text-green-700 dark:bg-semantic-success-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="p-2 text-accent-1 hover:bg-accent-1-50 dark:hover:bg-accent-1-900/30 rounded-lg transition">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Content Management
                </h3>
                <button className="px-4 py-2 bg-accent-1-600 text-white rounded-lg hover:bg-accent-1-700 transition flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add Content</span>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {["Business Studies", "Accountancy", "Economics"].map((subject, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <BookOpen className="h-8 w-8 text-accent-1 dark:text-blue-400 mb-3" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {subject}
                    </h4>
                    <p className="text-sm font-body text-text-secondary dark:text-gray-400 mb-4">
                      23 chapters • 1,200 questions
                    </p>
                    <button className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" && activeTab !== "users" && activeTab !== "content" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <p className="font-body text-text-secondary dark:text-gray-300 text-lg">
              {tabs.find((t) => t.id === activeTab)?.label} management coming soon...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPanel() {
  if (!hasClerkKey) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-primary dark:text-white mb-2">
            Authentication unavailable
          </h1>
          <p className="font-body text-text-secondary dark:text-gray-300">
            Provide NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable the admin experience.
          </p>
        </div>
      </div>
    );
  }

  return <AdminPanelWithAuth />;
}
