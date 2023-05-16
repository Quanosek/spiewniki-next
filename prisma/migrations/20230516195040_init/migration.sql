-- CreateTable
CREATE TABLE "Piesn" (
    "id" TEXT NOT NULL,
    "hymnbook" CHAR(1) NOT NULL,
    "number" VARCHAR(4) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "lirycs" TEXT NOT NULL,

    CONSTRAINT "Piesn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spiewnik" (
    "name" CHAR(1) NOT NULL,
    "full_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Spiewnik_pkey" PRIMARY KEY ("name")
);
