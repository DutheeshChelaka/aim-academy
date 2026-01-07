/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('REGISTRATION', 'PASSWORD_RESET', 'LOGIN');

-- AlterTable
ALTER TABLE "OTP" ADD COLUMN     "type" "OTPType" NOT NULL DEFAULT 'REGISTRATION';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE INDEX "OTP_type_idx" ON "OTP"("type");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
