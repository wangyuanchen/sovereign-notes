CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"title" text,
	"encrypted_content" text NOT NULL,
	"iv" varchar(255) NOT NULL,
	"salt" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"note_id" integer,
	"task" text NOT NULL,
	"completed" boolean DEFAULT false,
	"due_date" timestamp,
	"frequency" text DEFAULT 'once',
	"interval" integer DEFAULT 1,
	"end_date" timestamp,
	"last_run" timestamp,
	"next_run" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"plan" varchar(50) DEFAULT 'free',
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE no action ON UPDATE no action;