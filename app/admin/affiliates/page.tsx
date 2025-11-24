"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Users, Check, X, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface Affiliate {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  affiliateCode: string;
  commissionRate: number;
  status: string;
  createdAt: string;
  _count: {
    clicks: number;
    conversions: number;
  };
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchAffiliates();
  }, [statusFilter]);

  const fetchAffiliates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      const response = await fetch(`/api/admin/affiliates?${params}`);
      const data = await response.json();
      if (response.ok) {
        setAffiliates(data.affiliates);
      }
    } catch (error) {
      console.error("Error fetching affiliates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (affiliateId: string) => {
    if (!confirm("Approve this affiliate application?")) return;

    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        alert("Affiliate approved successfully");
        fetchAffiliates();
      }
    } catch (error) {
      alert("Failed to approve affiliate");
    }
  };

  const handleReject = async (affiliateId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectedReason: reason }),
      });

      if (response.ok) {
        alert("Affiliate rejected");
        fetchAffiliates();
      }
    } catch (error) {
      alert("Failed to reject affiliate");
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern dark:bg-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Affiliate Management
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage affiliate partner applications
          </p>
        </motion.div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Affiliates List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
            </div>
          ) : affiliates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">No affiliates found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Commission
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Performance
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
                  {affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {affiliate.companyName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {affiliate.contactName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {affiliate.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {affiliate.affiliateCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {affiliate.commissionRate}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <div>Clicks: {affiliate._count.clicks}</div>
                          <div>Conversions: {affiliate._count.conversions}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            affiliate.status === "approved"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : affiliate.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {affiliate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {affiliate.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(affiliate.id)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(affiliate.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <a
                            href={`/api/admin/affiliates/${affiliate.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
