/*
  Warnings:

  - You are about to drop the column `duration` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `englishNotePdf` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `englishSubtitle` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `publishDate` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `sinhalaNotePdf` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `tamilNotePdf` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `tamilSubtitle` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Lesson` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Lesson` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `phoneNumber` on the `OTP` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `OTP` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `completedAt` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `deviceIds` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddresses` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `lastWatchedAt` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `maxViews` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `watchedSeconds` on the `Progress` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,videoId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `OTP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoId` to the `Progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_gradeId_fkey";

-- DropIndex
DROP INDEX "OTP_phoneNumber_code_idx";

-- DropIndex
DROP INDEX "Progress_userId_lessonId_key";

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "paymentId" TEXT;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "duration",
DROP COLUMN "englishNotePdf",
DROP COLUMN "englishSubtitle",
DROP COLUMN "publishDate",
DROP COLUMN "sinhalaNotePdf",
DROP COLUMN "tamilNotePdf",
DROP COLUMN "tamilSubtitle",
DROP COLUMN "videoId",
DROP COLUMN "videoUrl",
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "OTP" DROP COLUMN "phoneNumber",
DROP COLUMN "verified",
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "lessonId",
DROP COLUMN "metadata",
ADD COLUMN     "paymentGateway" TEXT NOT NULL DEFAULT 'PayHere',
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "paymentMethod" DROP NOT NULL,
ALTER COLUMN "transactionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Progress" DROP COLUMN "completedAt",
DROP COLUMN "createdAt",
DROP COLUMN "deviceIds",
DROP COLUMN "ipAddresses",
DROP COLUMN "lastWatchedAt",
DROP COLUMN "lessonId",
DROP COLUMN "maxViews",
DROP COLUMN "watchedSeconds",
ADD COLUMN     "deviceFingerprint" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "videoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "deviceId",
DROP COLUMN "userAgent",
ADD COLUMN     "deviceFingerprint" TEXT,
ALTER COLUMN "ipAddress" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_videoId_key" ON "Progress"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
