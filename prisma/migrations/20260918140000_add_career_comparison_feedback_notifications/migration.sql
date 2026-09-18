CREATE TABLE "CareerComparison" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "careerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CareerComparison_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CareerComparison_studentId_careerId_key" ON "CareerComparison"("studentId", "careerId");
CREATE INDEX "CareerComparison_studentId_createdAt_idx" ON "CareerComparison"("studentId", "createdAt");
ALTER TABLE "CareerComparison" ADD CONSTRAINT "CareerComparison_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CareerComparison" ADD CONSTRAINT "CareerComparison_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ResourceRating" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "resourceId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResourceRating_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ResourceRating_studentId_resourceId_key" ON "ResourceRating"("studentId", "resourceId");
CREATE INDEX "ResourceRating_resourceId_idx" ON "ResourceRating"("resourceId");
ALTER TABLE "ResourceRating" ADD CONSTRAINT "ResourceRating_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourceRating" ADD CONSTRAINT "ResourceRating_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LearningResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ResourceBookmark" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResourceBookmark_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ResourceBookmark_studentId_resourceId_key" ON "ResourceBookmark"("studentId", "resourceId");
CREATE INDEX "ResourceBookmark_studentId_createdAt_idx" ON "ResourceBookmark"("studentId", "createdAt");
ALTER TABLE "ResourceBookmark" ADD CONSTRAINT "ResourceBookmark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourceBookmark" ADD CONSTRAINT "ResourceBookmark_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "LearningResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PROGRESS',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_studentId_createdAt_idx" ON "Notification"("studentId", "createdAt");
CREATE INDEX "Notification_studentId_readAt_idx" ON "Notification"("studentId", "readAt");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
