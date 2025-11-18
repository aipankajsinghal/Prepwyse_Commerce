"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Copy,
  Check,
  Users,
  Trophy,
  Sparkles,
  Share2,
  ExternalLink,
  Award,
  TrendingUp,
} from "lucide-react";

interface ReferralStats {
  totalReferrals: number;
  signedUpReferrals: number;
  subscribedReferrals: number;
  totalRewards: number;
  appliedRewards: number;
  pendingRewards: number;
}

interface Referral {
  id: string;
  refereeEmail: string;
  status: string;
  createdAt: string;
}

interface Reward {
  id: string;
  type: string;
  rewardType: string;
  rewardValue: number;
  description: string;
  applied: boolean;
  appliedAt: string | null;
  createdAt: string;
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  referralCount: number;
  subscribedCount: number;
}

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState("");
  const [referralUrl, setReferralUrl] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [recentReferrals, setRecentReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get referral code
      const codeRes = await fetch("/api/referral/code");
      const codeData = await codeRes.json();
      setReferralCode(codeData.referralCode);
      setReferralUrl(codeData.referralUrl);

      // Get stats
      const statsRes = await fetch("/api/referral/stats");
      const statsData = await statsRes.json();
      setStats(statsData.stats);
      setRecentReferrals(statsData.recentReferrals || []);
      setRewards(statsData.rewards || []);

      // Get leaderboard
      const leaderRes = await fetch("/api/referral/leaderboard?limit=10");
      const leaderData = await leaderRes.json();
      setLeaderboard(leaderData.leaderboard || []);
    } catch (error) {
      console.error("Failed to load referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join PrepWyse Commerce",
          text: "Sign up using my referral code and get started with AI-powered learning!",
          url: referralUrl,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      copyToClipboard(referralUrl);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "subscribed":
        return "text-semantic-success";
      case "signed_up":
        return "text-accent-2";
      default:
        return "text-text-muted";
    }
  };

  const getRewardIcon = (type: string) => {
    if (type.includes("subscription")) return Trophy;
    return Gift;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Gift className="h-12 w-12 text-accent-1" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-full bg-accent-1/10 text-accent-1">
            <Gift className="h-5 w-5" />
            <span className="font-display font-semibold">Referral Program</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 text-text-primary">
            Share & Earn Rewards
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-body">
            Invite friends to PrepWyse and earn points and premium days when they sign up and subscribe
          </p>
        </motion.div>

        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="edu-card bg-gradient-to-br from-accent-1 to-accent-1-dark text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold">Your Referral Code</h2>
                <Sparkles className="h-8 w-8 animate-pulse-subtle" />
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="font-display text-3xl font-bold tracking-wider">
                    {referralCode}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(referralCode)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-xl transition-all"
                >
                  {copied ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <Copy className="h-6 w-6" />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-3 mb-6">
                <ExternalLink className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 text-sm font-mono truncate">
                  {referralUrl}
                </div>
                <button
                  onClick={() => copyToClipboard(referralUrl)}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <button
                onClick={shareReferral}
                className="w-full bg-white text-accent-1 font-display font-semibold py-3 rounded-xl hover:bg-white/90 transition-all flex items-center justify-center space-x-2"
              >
                <Share2 className="h-5 w-5" />
                <span>Share with Friends</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="edu-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text-muted text-sm mb-1">Total Referrals</div>
                  <div className="font-display text-4xl font-bold text-accent-1">
                    {stats.totalReferrals}
                  </div>
                  <div className="text-text-secondary text-sm mt-1">
                    {stats.signedUpReferrals} signed up
                  </div>
                </div>
                <Users className="h-12 w-12 text-accent-1/30" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="edu-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text-muted text-sm mb-1">Subscribed</div>
                  <div className="font-display text-4xl font-bold text-accent-2">
                    {stats.subscribedReferrals}
                  </div>
                  <div className="text-text-secondary text-sm mt-1">
                    Premium conversions
                  </div>
                </div>
                <Trophy className="h-12 w-12 text-accent-2/30" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="edu-card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text-muted text-sm mb-1">Total Rewards</div>
                  <div className="font-display text-4xl font-bold text-semantic-success">
                    {stats.totalRewards}
                  </div>
                  <div className="text-text-secondary text-sm mt-1">
                    {stats.pendingRewards} pending
                  </div>
                </div>
                <Award className="h-12 w-12 text-semantic-success/30" />
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Referrals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="edu-card">
              <h3 className="font-display text-2xl font-bold mb-6 flex items-center">
                <Users className="h-6 w-6 mr-3 text-accent-1" />
                Recent Referrals
              </h3>
              <div className="space-y-4">
                {recentReferrals.length === 0 ? (
                  <div className="text-center py-8 text-text-muted">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>No referrals yet. Start sharing your code!</p>
                  </div>
                ) : (
                  recentReferrals.map((referral, idx) => (
                    <motion.div
                      key={referral.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface border border-text-primary/5"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-accent-1/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-accent-1" />
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">
                            {referral.refereeEmail}
                          </div>
                          <div className="text-sm text-text-muted">
                            {new Date(referral.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-display text-sm font-semibold ${getStatusColor(referral.status)}`}>
                        {referral.status.replace("_", " ").toUpperCase()}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="edu-card">
              <h3 className="font-display text-2xl font-bold mb-6 flex items-center">
                <Gift className="h-6 w-6 mr-3 text-accent-2" />
                Your Rewards
              </h3>
              <div className="space-y-4">
                {rewards.length === 0 ? (
                  <div className="text-center py-8 text-text-muted">
                    <Gift className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>No rewards yet. Invite friends to earn!</p>
                  </div>
                ) : (
                  rewards.slice(0, 5).map((reward, idx) => {
                    const Icon = getRewardIcon(reward.type);
                    return (
                      <motion.div
                        key={reward.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.05 }}
                        className={`p-4 rounded-xl border ${
                          reward.applied
                            ? "bg-semantic-success/5 border-semantic-success/20"
                            : "bg-accent-1/5 border-accent-1/20"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Icon className={`h-5 w-5 mt-0.5 ${reward.applied ? "text-semantic-success" : "text-accent-1"}`} />
                            <div>
                              <div className="font-medium text-text-primary mb-1">
                                {reward.description}
                              </div>
                              <div className="text-sm text-text-muted">
                                {new Date(reward.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {reward.applied && (
                            <Check className="h-5 w-5 text-semantic-success" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <div className="edu-card">
            <h3 className="font-display text-2xl font-bold mb-6 flex items-center">
              <Trophy className="h-6 w-6 mr-3 text-accent-1" />
              Top Referrers
            </h3>
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + idx * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    idx < 3
                      ? "bg-gradient-to-r from-accent-1/10 to-accent-2/10 border-2 border-accent-1/20"
                      : "bg-surface border border-text-primary/5"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold ${
                        idx === 0
                          ? "bg-yellow-500 text-white"
                          : idx === 1
                          ? "bg-gray-400 text-white"
                          : idx === 2
                          ? "bg-orange-600 text-white"
                          : "bg-accent-1/10 text-accent-1"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-text-primary">
                        {entry.userName}
                      </div>
                      <div className="text-sm text-text-muted">
                        {entry.subscribedCount} premium conversions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-bold text-accent-1">
                      {entry.referralCount}
                    </div>
                    <div className="text-xs text-text-muted">referrals</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Share Your Code",
                desc: "Send your unique referral link to friends",
                icon: Share2,
              },
              {
                step: "2",
                title: "They Sign Up",
                desc: "Earn 50 points when they create an account",
                icon: Users,
              },
              {
                step: "3",
                title: "Earn Rewards",
                desc: "Get 7 days premium when they subscribe",
                icon: TrendingUp,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
                className="edu-card text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-accent-1 to-accent-1-dark rounded-2xl flex items-center justify-center text-white font-display text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <item.icon className="h-10 w-10 text-accent-2 mx-auto mb-4" />
                <h4 className="font-display text-xl font-semibold mb-2">
                  {item.title}
                </h4>
                <p className="text-text-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
