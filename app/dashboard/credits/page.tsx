"use client";

import { useEffect, useState } from "react";
import { Coins, Plus, Minus, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function CreditsPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditsData();
  }, []);

  const fetchCreditsData = async () => {
    try {
      const response = await fetch("/api/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === "signup_bonus" || type === "subscription_purchase") {
      return <Plus className="w-4 h-4 text-emerald-500" />;
    }
    return <Minus className="w-4 h-4 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    if (type === "signup_bonus" || type === "subscription_purchase") {
      return "text-emerald-600";
    }
    return "text-red-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Wallet</h1>
        <p className="text-gray-600">
          Manage your credits and view transaction history
        </p>
      </div>

      {/* Credit Balance Card */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-amber-100 text-sm font-medium mb-2">
              Available Credits
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{credits}</span>
              <span className="text-2xl text-amber-100">
                {credits === 1 ? "credit" : "credits"}
              </span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Coins className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/pricing" className="flex-1">
            <Button className="w-full bg-white hover:bg-gray-100 text-amber-600 font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Buy More Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* How Credits Work */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              How Credits Work
            </h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• 1 credit = Restore 1 photo with AI</li>
              <li>• 1 credit = Export with 4K upscaling</li>
              <li>• Get 50 credits for $19.99/month</li>
              <li>• Only $0.40 per photo (restore + export)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction History
            </h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {history.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Coins className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No transactions yet</p>
              <p className="text-sm mt-1">
                Start restoring photos to see your activity here
              </p>
            </div>
          ) : (
            history.map((transaction) => (
              <div
                key={transaction.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${getTransactionColor(
                        transaction.type
                      )}`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.amount === 1 || transaction.amount === -1
                        ? "credit"
                        : "credits"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Low Credit Warning */}
      {credits !== null && credits < 2 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Running Low on Credits
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                You only have {credits} {credits === 1 ? "credit" : "credits"}{" "}
                left. Get more to continue restoring your precious memories.
              </p>
              <Link href="/pricing">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Get More Credits
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
