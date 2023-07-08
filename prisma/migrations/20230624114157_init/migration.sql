-- CreateTable
CREATE TABLE "Hymn" (
    "id" INTEGER NOT NULL,
    "hymnbook" CHAR(1) NOT NULL,
    "number" VARCHAR(4) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "lyrics" TEXT NOT NULL,
    "presentation" TEXT NOT NULL,
    "verse" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "Hymn_pkey" PRIMARY KEY ("id")
);
