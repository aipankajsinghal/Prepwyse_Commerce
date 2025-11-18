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
    <main className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-6"
      >
        <nav className="flex justify-between items-center backdrop-blur-sm bg-surface-elevated/70 rounded-2xl px-6 py-4 shadow-md border border-text-primary/10">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent-1 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition" />
              <BookOpen className="h-8 w-8 text-accent-1 relative" />
            </div>
            <span className="text-2xl font-display font-bold text-primary">
              PrepWyse Commerce
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-in"
              className="px-5 py-2.5 text-text-secondary hover:text-accent-1 font-medium font-display transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="btn-primary"
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
          <div className="absolute inset-0 bg-gradient-to-r from-accent-1/10 to-accent-2/10 blur-3xl opacity-50" />
          
          <motion.div
            className="relative inline-block mb-6 animate-float"
          >
            <Sparkles className="h-16 w-16 text-accent-1 mx-auto" />
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 relative animate-reveal">
            <span className="text-primary">
              Master Commerce
            </span>
            <br />
            <span className="text-accent-1">
              with AI-Powered Learning
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-body text-text-secondary mb-10 max-w-4xl mx-auto leading-relaxed animate-reveal delay-100">
            Transform your exam preparation with intelligent, adaptive learning.
            Personalized for Class 11, Class 12, and CUET Commerce students across India.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-reveal delay-200"
          >
            <Link
              href="/sign-up"
              className="group btn-primary flex items-center space-x-2"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="btn-secondary flex items-center space-x-2">
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
              className="edu-card"
            >
              <div className="text-3xl font-display font-bold text-accent-1">
                {stat.value}
              </div>
              <div className="text-sm font-body text-text-secondary mt-2">
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
            className="text-4xl md:text-5xl font-display font-bold mb-4 text-primary"
          >
            Everything You Need to Excel
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl font-body text-text-secondary max-w-2xl mx-auto"
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
              color: "accent-1",
            },
            {
              icon: Target,
              title: "Adaptive Difficulty",
              description: "Automatically adjusts to challenge you at the right level",
              color: "accent-2",
            },
            {
              icon: Trophy,
              title: "Mock Tests",
              description: "Full-length exams matching CUET and board exam patterns",
              color: "accent-1",
            },
            {
              icon: TrendingUp,
              title: "Performance Analytics",
              description: "Detailed insights into your strengths and improvement areas",
              color: "accent-2",
            },
            {
              icon: Award,
              title: "Personalized Recommendations",
              description: "AI-powered study plans based on your unique learning journey",
              color: "accent-1",
            },
            {
              icon: Users,
              title: "Multi-Platform Access",
              description: "Study seamlessly across mobile, tablet, and desktop devices",
              color: "accent-2",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group edu-card"
            >
              <div className={`h-14 w-14 bg-${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-text-primary">
                {feature.title}
              </h3>
              <p className="font-body text-text-secondary leading-relaxed">
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
          <h2 className="text-4xl font-display font-bold mb-4 text-primary">
            Comprehensive Coverage
          </h2>
          <p className="text-xl font-body text-text-secondary">
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
              className="edu-card border-2 border-accent-1/20"
            >
              <subject.icon className="h-12 w-12 text-accent-1 mb-4" />
              <h3 className="text-2xl font-display font-bold mb-2 text-text-primary">
                {subject.name}
              </h3>
              <p className="font-body text-text-secondary">
                {subject.chapters} comprehensive chapters
              </p>
              <div className="mt-4 flex items-center text-sm font-display font-semibold text-accent-2">
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
          className="relative bg-gradient-to-r from-accent-1 to-accent-2 rounded-3xl p-12 md:p-20 text-center overflow-hidden animate-pulse-subtle"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl font-body text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of students already excelling with AI-powered preparation
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center space-x-2 px-10 py-5 bg-surface-elevated text-accent-1 text-lg rounded-xl font-display font-bold hover:bg-white transition-all transform hover:scale-105 shadow-2xl"
            >
              <span>Start Your Free Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-accent-1" />
                <span className="text-xl font-display font-bold">PrepWyse</span>
              </div>
              <p className="font-body text-white/70">
                AI-powered learning for commerce students
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Product</h4>
              <ul className="space-y-2 font-body text-white/70">
                <li><Link href="/quiz" className="hover:text-accent-1 transition">Quizzes</Link></li>
                <li><Link href="/mock-test" className="hover:text-accent-1 transition">Mock Tests</Link></li>
                <li><Link href="/recommendations" className="hover:text-accent-1 transition">AI Recommendations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Company</h4>
              <ul className="space-y-2 font-body text-white/70">
                <li><Link href="/about" className="hover:text-accent-1 transition">About</Link></li>
                <li><Link href="/contact" className="hover:text-accent-1 transition">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-accent-1 transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 font-body text-white/70">
                <li><Link href="/privacy" className="hover:text-accent-1 transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-accent-1 transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center font-body text-white/70">
            <p>© 2024 PrepWyse Commerce. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
