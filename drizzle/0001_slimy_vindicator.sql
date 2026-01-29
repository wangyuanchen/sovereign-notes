ALTER TABLE "users" ADD COLUMN "subscription_status" varchar(50) DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "wallet_address" varchar(255);