import { uploadImageAssets } from "@/lib/upload-image";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { photos } from "@/db/schema";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const config = {
  api: { bodyParser: false }, // Disable default body parsing
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type - only allow image files
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only image files are allowed." },
        { status: 400 },
      );
    }

    // Validate file size - limit to 10MB
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        { error: "File too large. Maximum size allowed is 10MB." },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a unique filename with original extension
    const fileExt = file.name.split(".").pop() || "";
    const timestamp = Date.now();
    const filename = `upload-${timestamp}.${fileExt || "png"}`;

    // Upload the file
    const url = await uploadImageAssets(buffer, filename);

    // Save photo metadata to database
    const photoId = randomUUID();
    await db.insert(photos).values({
      id: photoId,
      userId: session.user.id,
      name: file.name,
      url,
      size: file.size,
      restored: 0,
      exported: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      url,
      id: photoId,
      name: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}
