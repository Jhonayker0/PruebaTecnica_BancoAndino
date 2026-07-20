-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'RETIRED');

-- CreateEnum
CREATE TYPE "TypeDoc" AS ENUM ('CC', 'CE', 'PAS', 'CIP');

-- CreateEnum
CREATE TYPE "LevelAccess" AS ENUM ('STANDARD', 'RESTRICTED', 'TOTAL', 'INTERNAL_VISITOR', 'SUPERUSER');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTRY', 'EXIT');

-- CreateTable
CREATE TABLE "employee" (
    "id" SERIAL NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "secondLastName" TEXT,
    "typeDoc" "TypeDoc" NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "email" TEXT,
    "phone" TEXT,
    "biostarId" TEXT,
    "levelAccess" "LevelAccess" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site" (
    "id" SERIAL NOT NULL,
    "siteCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employeeSite" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "siteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employeeSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accessLog" (
    "id" SERIAL NOT NULL,
    "employeeSiteId" INTEGER NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_employeeCode_key" ON "employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employee_biostarId_key" ON "employee"("biostarId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_typeDoc_documentNumber_key" ON "employee"("typeDoc", "documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "site_siteCode_key" ON "site"("siteCode");

-- CreateIndex
CREATE INDEX "employeeSite_employeeId_idx" ON "employeeSite"("employeeId");

-- CreateIndex
CREATE INDEX "employeeSite_siteId_idx" ON "employeeSite"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "employeeSite_employeeId_siteId_key" ON "employeeSite"("employeeId", "siteId");

-- CreateIndex
CREATE INDEX "accessLog_employeeSiteId_idx" ON "accessLog"("employeeSiteId");

-- AddForeignKey
ALTER TABLE "employeeSite" ADD CONSTRAINT "employeeSite_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employeeSite" ADD CONSTRAINT "employeeSite_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accessLog" ADD CONSTRAINT "accessLog_employeeSiteId_fkey" FOREIGN KEY ("employeeSiteId") REFERENCES "employeeSite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
