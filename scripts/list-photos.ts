import { db } from "../db/drizzle";
import { photos, user } from "../db/schema";
import { eq } from "drizzle-orm";

const email = "cpsbulkwholesale@gmail.com";

async function listPhotos() {
  try {
    // Find user by email
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (users.length === 0) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`\nUser: ${email} (ID: ${userId})\n`);

    // Get all photos for this user
    const userPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.userId, userId));

    console.log(`Found ${userPhotos.length} photo(s):\n`);

    userPhotos.forEach((photo, index) => {
      console.log(`Photo ${index + 1}:`);
      console.log(`  ID: ${photo.id}`);
      console.log(`  Name: ${photo.name}`);
      console.log(`  Restored: ${photo.restored === 1 ? 'Yes' : 'No'}`);
      console.log(`  Exported: ${photo.exported === 1 ? 'Yes' : 'No'}`);
      console.log(`  Created: ${photo.createdAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error("Error listing photos:", error);
    process.exit(1);
  }
}

listPhotos();
