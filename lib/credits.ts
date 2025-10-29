import { db } from "@/db/drizzle";
import { userCredits, creditTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export type CreditTransactionType =
  | "signup_bonus"
  | "subscription_purchase"
  | "restore_photo"
  | "export_photo";

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  relatedId: string | null;
  createdAt: Date;
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const result = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  if (result.length === 0) {
    // User doesn't have credits record yet, create one with 3 free credits
    await createUserCredits(userId);
    return 3;
  }

  return result[0].credits;
}

/**
 * Check if user has sufficient credits
 */
export async function hasCredits(
  userId: string,
  amount: number
): Promise<boolean> {
  const balance = await getUserCredits(userId);
  return balance >= amount;
}

/**
 * Create initial credits record for new user
 */
export async function createUserCredits(userId: string): Promise<void> {
  try {
    await db.insert(userCredits).values({
      id: randomUUID(),
      userId,
      credits: 3,
      lifetimeCreditsUsed: 0,
      lifetimeCreditsAdded: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Log the signup bonus transaction
    await db.insert(creditTransactions).values({
      id: randomUUID(),
      userId,
      amount: 3,
      type: "signup_bonus",
      description: "Welcome bonus - 3 free credits",
      relatedId: null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Ignore if user credits already exist (race condition)
    console.error("Error creating user credits:", error);
  }
}

/**
 * Deduct credits and log transaction
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: "restore_photo" | "export_photo",
  description: string,
  relatedId?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Check if user has enough credits
    const currentBalance = await getUserCredits(userId);

    if (currentBalance < amount) {
      return {
        success: false,
        newBalance: currentBalance,
        error: "Insufficient credits",
      };
    }

    // Deduct credits
    const newBalance = currentBalance - amount;
    await db
      .update(userCredits)
      .set({
        credits: newBalance,
        lifetimeCreditsUsed: (
          await db.select().from(userCredits).where(eq(userCredits.userId, userId))
        )[0].lifetimeCreditsUsed + amount,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));

    // Log transaction
    await db.insert(creditTransactions).values({
      id: randomUUID(),
      userId,
      amount: -amount,
      type,
      description,
      relatedId: relatedId || null,
      createdAt: new Date(),
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error("Error deducting credits:", error);
    return {
      success: false,
      newBalance: await getUserCredits(userId),
      error: "Failed to deduct credits",
    };
  }
}

/**
 * Add credits (for purchases/subscriptions)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: "signup_bonus" | "subscription_purchase",
  description: string,
  relatedId?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    const currentBalance = await getUserCredits(userId);
    const newBalance = currentBalance + amount;

    await db
      .update(userCredits)
      .set({
        credits: newBalance,
        lifetimeCreditsAdded: (
          await db.select().from(userCredits).where(eq(userCredits.userId, userId))
        )[0].lifetimeCreditsAdded + amount,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));

    // Log transaction
    await db.insert(creditTransactions).values({
      id: randomUUID(),
      userId,
      amount,
      type,
      description,
      relatedId: relatedId || null,
      createdAt: new Date(),
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error("Error adding credits:", error);
    return {
      success: false,
      newBalance: await getUserCredits(userId),
      error: "Failed to add credits",
    };
  }
}

/**
 * Refund credits (if API call fails)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  relatedId?: string
): Promise<{ success: boolean; newBalance: number }> {
  try {
    const currentBalance = await getUserCredits(userId);
    const newBalance = currentBalance + amount;

    await db
      .update(userCredits)
      .set({
        credits: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId));

    // Log refund transaction
    await db.insert(creditTransactions).values({
      id: randomUUID(),
      userId,
      amount,
      type: "signup_bonus", // Using as a generic type for refunds
      description: `Refund: ${reason}`,
      relatedId: relatedId || null,
      createdAt: new Date(),
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error("Error refunding credits:", error);
    return {
      success: false,
      newBalance: await getUserCredits(userId),
    };
  }
}

/**
 * Get credit transaction history
 */
export async function getCreditHistory(
  userId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  const transactions = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(creditTransactions.createdAt)
    .limit(limit);

  return transactions;
}
