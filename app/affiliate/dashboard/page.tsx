"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, MousePointerClick, ShoppingCart, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function AffiliateDashboardPage() {
  const [credentials, setCredentials] = useState({ email: "", affiliateCode: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/affiliates/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data);
        setLoggedIn(true);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to load dashboard. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Affiliate Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enter your credentials to view your performance
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Affiliate Code
              </label>
              <input
                type="text"
                required
                value={credentials.affiliateCode}
                onChange={(e) => setCredentials({ ...credentials, affiliateCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                placeholder="YOUR-CODE"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? "Loading..." : "View Dashboard"}
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Don't have an account?{" "}
              <a href="/affiliate/register" className="text-blue-600 hover:underline">
                Register here
              </a>
            </p>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {stats.affiliate.companyName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Affiliate Code: <span className="font-mono font-bold">{stats.affiliate.affiliateCode}</span> | 
            Commission Rate: <span className="font-bold">{stats.affiliate.commissionRate}%</span>
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.metrics.totalClicks}
                </p>
              </div>
              <MousePointerClick className="h-12 w-12 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conversions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.metrics.totalConversions}
                </p>
              </div>
              <ShoppingCart className="h-12 w-12 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.metrics.conversionRate}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Commission</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{Number(stats.metrics.totalCommission).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-yellow-600" />
            </div>
          </motion.div>
        </div>

        {/* Commission Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Commission Breakdown
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Paid Commission</span>
                <span className="font-bold text-green-600">
                  ₹{Number(stats.metrics.paidCommission).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Pending Commission</span>
                <span className="font-bold text-yellow-600">
                  ₹{Number(stats.metrics.pendingCommission).toFixed(2)}
                </span>
              </div>
              <div className="border-t dark:border-gray-700 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total Earned</span>
                  <span className="font-bold text-blue-600 text-lg">
                    ₹{Number(stats.metrics.totalCommission).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Performance
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Last 30 Days</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Clicks</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.last30Days.clicks}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Conversions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.last30Days.conversions}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Last 7 Days</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Clicks</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.last7Days.clicks}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Conversions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats.last7Days.conversions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Conversions */}
        {stats.recentConversions && stats.recentConversions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Conversions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentConversions.map((conversion: any) => (
                    <tr key={conversion.id}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(conversion.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        ₹{Number(conversion.orderValue).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ₹{Number(conversion.commissionAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            conversion.status === "paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          }`}
                        >
                          {conversion.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setLoggedIn(false);
              setStats(null);
              setCredentials({ email: "", affiliateCode: "" });
            }}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
