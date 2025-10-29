import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { photos } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET /api/photos - Get all photos for the current user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.userId, session.user.id))
      .orderBy(desc(photos.createdAt));

    // Convert integer booleans to actual booleans
    const photosWithBooleans = userPhotos.map((photo) => ({
      ...photo,
      restored: photo.restored === 1,
      exported: photo.exported === 1,
    }));

    return NextResponse.json({ photos: photosWithBooleans });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// POST /api/photos - Create a new photo record
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, url, size } = body;

    if (!name || !url || !size) {
      return NextResponse.json(
        { error: "name, url, and size are required" },
        { status: 400 }
      );
    }

    const photoId = id || randomUUID();

    await db.insert(photos).values({
      id: photoId,
      userId: session.user.id,
      name,
      url,
      size,
      restored: 0,
      exported: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      photo: {
        id: photoId,
        name,
        url,
        size,
        restored: false,
        exported: false,
      },
    });
  } catch (error) {
    console.error("Error creating photo:", error);
    return NextResponse.json(
      { error: "Failed to create photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/photos - Delete a photo
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 }
      );
    }

    // Delete only if it belongs to the user
    await db
      .delete(photos)
      .where(and(eq(photos.id, photoId), eq(photos.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
