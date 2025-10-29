import { auth } from "@/lib/auth";
import { getUserCredits, deductCredits, refundCredits } from "@/lib/credits";
import { upscalePhoto, waitForUpscale } from "@/lib/magnific-service";
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
          message: "You need 1 credit to export in 4K quality",
          credits,
        },
        { status: 402 }
      );
    }

    // Deduct credit BEFORE processing
    const deduction = await deductCredits(
      userId,
      1,
      "export_photo",
      "2x upscaling with Magnific Precision V2",
      photoId
    );

    if (!deduction.success) {
      return NextResponse.json(
        { error: deduction.error || "Failed to deduct credits" },
        { status: 500 }
      );
    }

    try {
      // Submit upscaling task
      const { taskId } = await upscalePhoto(imageUrl);

      // Wait for upscaling to complete (with polling)
      const upscaledUrls = await waitForUpscale(taskId);

      if (upscaledUrls.length === 0) {
        throw new Error("No upscaled images generated");
      }

      // Update photo in database to mark as exported
      if (photoId) {
        await db
          .update(photos)
          .set({
            exported: 1,
            updatedAt: new Date(),
          })
          .where(eq(photos.id, photoId));
      }

      // Return success with upscaled image URL
      return NextResponse.json({
        success: true,
        upscaledUrl: upscaledUrls[0],
        taskId,
        creditsRemaining: deduction.newBalance,
      });
    } catch (apiError) {
      // Refund credit if API call fails
      await refundCredits(
        userId,
        1,
        "4K export failed - credit refunded",
        photoId
      );

      console.error("Upscaling API error:", apiError);
      throw apiError;
    }
  } catch (error) {
    console.error("Export endpoint error:", error);
    return NextResponse.json(
      {
        error: "Failed to export photo",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
