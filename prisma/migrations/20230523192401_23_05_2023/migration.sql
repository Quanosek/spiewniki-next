/*
  Warnings:

  - You are about to drop the `Piesn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Spiewnik` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Piesn";

-- DropTable
DROP TABLE "Spiewnik";

-- CreateTable
CREATE TABLE "Hymn" (
    "id" TEXT NOT NULL,
    "hymnbook" CHAR(1) NOT NULL,
    "number" VARCHAR(4) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "lyrics" TEXT NOT NULL,

    CONSTRAINT "Hymn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hymnbook" (
    "name" CHAR(1) NOT NULL,
    "full_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Hymnbook_pkey" PRIMARY KEY ("name")
);
