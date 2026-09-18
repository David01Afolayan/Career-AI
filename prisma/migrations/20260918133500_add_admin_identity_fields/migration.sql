ALTER TABLE "User" ADD COLUMN "adminEmployeeId" TEXT;
ALTER TABLE "User" ADD COLUMN "adminProfession" TEXT;
ALTER TABLE "User" ADD COLUMN "adminDepartment" TEXT;
CREATE UNIQUE INDEX "User_adminEmployeeId_key" ON "User"("adminEmployeeId");
