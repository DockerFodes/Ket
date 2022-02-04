-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(20) NOT NULL,
    "prefix" VARCHAR(3),
    "lang" VARCHAR(2),
    "commands" INTEGER NOT NULL DEFAULT 1,
    "banned" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
