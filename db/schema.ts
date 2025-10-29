import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Subscription table for Polar webhook data
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// Credit System Tables
export const userCredits = pgTable("user_credits", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  credits: integer("credits").notNull().default(3),
  lifetimeCreditsUsed: integer("lifetimeCreditsUsed").notNull().default(0),
  lifetimeCreditsAdded: integer("lifetimeCreditsAdded").notNull().default(3),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // Positive for additions, negative for deductions
  type: text("type").notNull(), // 'signup_bonus', 'subscription_purchase', 'restore_photo', 'export_photo'
  description: text("description").notNull(),
  relatedId: text("relatedId"), // Optional: photo ID, subscription ID, etc.
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Photos Table
export const photos = pgTable("photos", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(), // Original photo URL
  size: integer("size").notNull(), // File size in bytes
  restored: integer("restored").notNull().default(0), // 0 = false, 1 = true
  restoredUrl: text("restoredUrl"), // URL of restored photo
  exported: integer("exported").notNull().default(0), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
