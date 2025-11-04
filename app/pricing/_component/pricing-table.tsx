"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Check, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SubscriptionDetails = {
  id: string;
  productId: string;
  status: string;
  amount: number;
  currency: string;
  recurringInterval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  organizationId: string | null;
};

type SubscriptionDetailsResult = {
  hasSubscription: boolean;
  subscription?: SubscriptionDetails;
  error?: string;
  errorType?: "CANCELED" | "EXPIRED" | "GENERAL";
};

interface PricingTableProps {
  subscriptionDetails: SubscriptionDetailsResult;
}

export default function PricingTable({
  subscriptionDetails,
}: PricingTableProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session.data?.user);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleCheckout = async (productId: string) => {
    if (isAuthenticated === false) {
      router.push("/sign-in");
      return;
    }

    try {
      await authClient.checkout({
        products: [productId],
      });
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Oops, something went wrong");
    }
  };

  const CREDIT_PACK_50 = process.env.NEXT_PUBLIC_CREDIT_PACK_50 || "0851cc18-b912-47e8-9415-868124c10297";

  return (
    <section className="flex flex-col items-center justify-center px-4 mb-24 w-full bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="text-center mb-16 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Simple, Transparent Pricing
        </div>
        <h1 className="text-5xl font-serif font-bold tracking-tight mb-6">
          Pay As You Go
        </h1>
        <p className="text-xl text-gray-600 font-light">
          No subscriptions. No commitments. Just buy credits and restore your memories.
        </p>
      </div>

      <div className="max-w-md w-full">
        {/* Credit Pack Card */}
        <Card className="relative border-2 border-amber-500 shadow-xl">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 text-sm font-semibold">
              MOST POPULAR
            </Badge>
          </div>

          <CardHeader className="text-center pb-8 pt-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">50 Credit Pack</CardTitle>
            <CardDescription className="text-base mt-2">
              Perfect for restoring your photo collection
            </CardDescription>
            <div className="mt-6">
              <span className="text-5xl font-bold text-gray-900">$19.99</span>
              <p className="text-sm text-gray-500 mt-2">One-time purchase</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-center font-semibold text-gray-900 mb-1">
                Only $0.40 per photo!
              </p>
              <p className="text-center text-sm text-gray-600">
                (Restore + Export in 4K quality)
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                What&apos;s Included:
              </h4>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">50 Restoration Credits</p>
                  <p className="text-sm text-gray-600">AI-powered photo restoration</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">4K Quality Export</p>
                  <p className="text-sm text-gray-600">AI upscaling included</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Colorization</p>
                  <p className="text-sm text-gray-600">Bring B&W photos to life</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Damage Removal</p>
                  <p className="text-sm text-gray-600">Scratches, tears, and stains</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Credits Never Expire</p>
                  <p className="text-sm text-gray-600">Use them whenever you want</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 px-8 pb-8">
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-lg py-6"
              onClick={() => handleCheckout(CREDIT_PACK_50)}
            >
              {isAuthenticated === false
                ? "Sign In to Purchase"
                : "Buy 50 Credits - $19.99"}
            </Button>
            <p className="text-xs text-center text-gray-500">
              Secure payment powered by Polar.sh
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Free Trial Info */}
      <div className="mt-16 max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                New to Snaptastic? Try It Free!
              </h3>
              <p className="text-gray-700 mb-3">
                Sign up and get <span className="font-bold">3 free credits</span> to test our AI-powered photo restoration. No credit card required.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push("/sign-up")}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl w-full">
        <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">How do credits work?</h3>
            <p className="text-gray-600">
              Each credit allows you to perform one action: restore a photo (1 credit) or export a photo in 4K quality (1 credit). Most users spend 2 credits per photo for the complete restore + export workflow.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Do credits expire?</h3>
            <p className="text-gray-600">
              No! Your credits never expire. Use them whenever you&apos;re ready to restore your photos.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I buy more credits later?</h3>
            <p className="text-gray-600">
              Absolutely! You can purchase additional credit packs anytime. Credits stack and never expire.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What if I&apos;m not satisfied?</h3>
            <p className="text-gray-600">
              We offer a 30-day money-back guarantee. If you&apos;re not happy with your restorations, contact us for a full refund.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
