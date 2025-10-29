CREATE TABLE "credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"relatedId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"credits" integer DEFAULT 3 NOT NULL,
	"lifetimeCreditsUsed" integer DEFAULT 0 NOT NULL,
	"lifetimeCreditsAdded" integer DEFAULT 3 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_credits_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_credits" ADD CONSTRAINT "user_credits_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;