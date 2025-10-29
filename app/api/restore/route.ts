import { auth } from "@/lib/auth";
import { getUserCredits, deductCredits, refundCredits } from "@/lib/credits";
import { restorePhoto, waitForRestoration } from "@/lib/gemini-service";
import { db } from "@/db/drizzle";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { imageUrl, photoId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const credits = await getUserCredits(userId);
    if (credits < 1) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: "You need 1 credit to restore a photo",
          credits,
        },
        { status: 402 }
      );
    }

    // Deduct credit BEFORE processing
    const deduction = await deductCredits(
      userId,
      1,
      "restore_photo",
      "Photo restoration with Gemini 2.5 Flash",
      photoId
    );

    if (!deduction.success) {
      return NextResponse.json(
        { error: deduction.error || "Failed to deduct credits" },
        { status: 500 }
      );
    }

    try {
      // Submit restoration task
      const { taskId } = await restorePhoto(imageUrl);

      // Wait for restoration to complete (with polling)
      const restoredUrls = await waitForRestoration(taskId);

      if (restoredUrls.length === 0) {
        throw new Error("No restored images generated");
      }

      // Update photo in database
      if (photoId) {
        await db
          .update(photos)
          .set({
            restored: 1,
            restoredUrl: restoredUrls[0],
            updatedAt: new Date(),
          })
          .where(eq(photos.id, photoId));
      }

      // Return success with restored image URL
      return NextResponse.json({
        success: true,
        restoredUrl: restoredUrls[0],
        taskId,
        creditsRemaining: deduction.newBalance,
      });
    } catch (apiError) {
      // Refund credit if API call fails
      await refundCredits(
        userId,
        1,
        "Photo restoration failed - credit refunded",
        photoId
      );

      console.error("Restoration API error:", apiError);
      throw apiError;
    }
  } catch (error) {
    console.error("Restore endpoint error:", error);
    return NextResponse.json(
      {
        error: "Failed to restore photo",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
