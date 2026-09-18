ALTER TABLE "User" ADD COLUMN "adminKeyFingerprint" TEXT;
CREATE UNIQUE INDEX "User_adminKeyFingerprint_key" ON "User"("adminKeyFingerprint");
