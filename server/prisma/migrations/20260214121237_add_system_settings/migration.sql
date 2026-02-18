-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "ai_generation_enabled" BOOLEAN NOT NULL DEFAULT true,
    "openai_api_key" TEXT,
    "google_client_id" TEXT,
    "stripe_secret_key" TEXT,
    "stripe_publishable_key" TEXT,
    "stripe_webhook_secret" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
