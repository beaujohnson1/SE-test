"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import Link from "next/link";

export default function CreditBalance() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg animate-pulse">
        <Coins className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-400">--</span>
      </div>
    );
  }

  return (
    <Link
      href="/dashboard/credits"
      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 rounded-lg transition-all duration-200 border border-amber-200 hover:border-amber-300"
    >
      <Coins className="w-4 h-4 text-amber-600" />
      <span className="text-sm font-semibold text-amber-900">
        {credits} {credits === 1 ? "Credit" : "Credits"}
      </span>
    </Link>
  );
}
