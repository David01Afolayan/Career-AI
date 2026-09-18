ALTER TABLE "User" ADD COLUMN "adminKeyHash" TEXT;
CREATE UNIQUE INDEX "User_adminKeyHash_key" ON "User"("adminKeyHash");
