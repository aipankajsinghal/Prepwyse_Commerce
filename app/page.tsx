"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  Trophy,
  TrendingUp,
  Sparkles,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-6"
      >
        <nav className="flex justify-between items-center backdrop-blur-sm bg-white/70 dark:bg-slate-900/70 rounded-2xl px-6 py-4 shadow-lg">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition" />
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 relative" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              PrepWyse Commerce
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-in"
              className="px-5 py-2.5 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 blur-3xl opacity-20 animate-pulse" />
          
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative inline-block mb-6"
          >
            <Sparkles className="h-16 w-16 text-yellow-500 mx-auto" />
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 relative">
            <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Master Commerce
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              with AI-Powered Learning
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
            Transform your exam preparation with intelligent, adaptive learning.
            Personalized for Class 11, Class 12, and CUET Commerce students across India.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/sign-up"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg rounded-xl font-bold transition-all transform hover:scale-105 shadow-2xl hover:shadow-blue-500/50 flex items-center space-x-2"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-900 dark:text-white text-lg rounded-xl font-semibold hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Watch Demo</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
        >
          {[
            { value: "10,000+", label: "Active Students" },
            { value: "50,000+", label: "Questions" },
            { value: "95%", label: "Success Rate" },
            { value: "AI-Powered", label: "Adaptive Learning" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-lg"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent"
          >
            Everything You Need to Excel
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Powered by advanced AI to adapt to your learning style and pace
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {[
            {
              icon: Sparkles,
              title: "AI-Generated Quizzes",
              description: "Smart questions tailored to your performance and learning gaps",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: Target,
              title: "Adaptive Difficulty",
              description: "Automatically adjusts to challenge you at the right level",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Trophy,
              title: "Mock Tests",
              description: "Full-length exams matching CUET and board exam patterns",
              color: "from-yellow-500 to-orange-500",
            },
            {
              icon: TrendingUp,
              title: "Performance Analytics",
              description: "Detailed insights into your strengths and improvement areas",
              color: "from-green-500 to-emerald-500",
            },
            {
              icon: Award,
              title: "Personalized Recommendations",
              description: "AI-powered study plans based on your unique learning journey",
              color: "from-indigo-500 to-purple-500",
            },
            {
              icon: Users,
              title: "Multi-Platform Access",
              description: "Study seamlessly across mobile, tablet, and desktop devices",
              color: "from-pink-500 to-rose-500",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className={`h-14 w-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Subjects Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Comprehensive Coverage
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Master all core commerce subjects
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Business Studies", chapters: 23, icon: BookOpen },
            { name: "Accountancy", chapters: 20, icon: Target },
            { name: "Economics", chapters: 18, icon: TrendingUp },
          ].map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border-2 border-blue-200 dark:border-blue-700"
            >
              <subject.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {subject.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {subject.chapters} comprehensive chapters
              </p>
              <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                <CheckCircle className="h-4 w-4 mr-2" />
                Full syllabus coverage
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 md:p-20 text-center overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of students already excelling with AI-powered preparation
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center space-x-2 px-10 py-5 bg-white text-blue-600 text-lg rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl"
            >
              <span>Start Your Free Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-xl font-bold">PrepWyse</span>
              </div>
              <p className="text-gray-400">
                AI-powered learning for commerce students
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/quiz" className="hover:text-white transition">Quizzes</Link></li>
                <li><Link href="/mock-test" className="hover:text-white transition">Mock Tests</Link></li>
                <li><Link href="/recommendations" className="hover:text-white transition">AI Recommendations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 PrepWyse Commerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
