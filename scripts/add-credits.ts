import { db } from "../db/drizzle";
import { user, userCredits, creditTransactions } from "../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const email = "cpsbulkwholesale@gmail.com";
const creditsToAdd = 10;

async function addCredits() {
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
    console.log(`Found user: ${email} (ID: ${userId})`);

    // Get current credits
    const currentCredits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    if (currentCredits.length === 0) {
      // Create credits record if it doesn't exist
      await db.insert(userCredits).values({
        id: randomUUID(),
        userId,
        credits: creditsToAdd,
        lifetimeCreditsUsed: 0,
        lifetimeCreditsAdded: creditsToAdd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Created new credits record with ${creditsToAdd} credits`);
    } else {
      // Update existing credits
      const newBalance = currentCredits[0].credits + creditsToAdd;
      const newLifetimeAdded = currentCredits[0].lifetimeCreditsAdded + creditsToAdd;

      await db
        .update(userCredits)
        .set({
          credits: newBalance,
          lifetimeCreditsAdded: newLifetimeAdded,
          updatedAt: new Date(),
        })
        .where(eq(userCredits.userId, userId));

      console.log(`Updated credits: ${currentCredits[0].credits} → ${newBalance}`);
    }

    // Log transaction
    await db.insert(creditTransactions).values({
      id: randomUUID(),
      userId,
      amount: creditsToAdd,
      type: "signup_bonus",
      description: `Admin credit addition - testing`,
      relatedId: null,
      createdAt: new Date(),
    });

    console.log(`✅ Successfully added ${creditsToAdd} credits to ${email}`);

    // Verify final balance
    const finalCredits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);

    console.log(`Final balance: ${finalCredits[0].credits} credits`);

    process.exit(0);
  } catch (error) {
    console.error("Error adding credits:", error);
    process.exit(1);
  }
}

addCredits();
