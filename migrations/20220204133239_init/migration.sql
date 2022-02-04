/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Users" (
    "id" VARCHAR(20) NOT NULL,
    "prefix" VARCHAR(3),
    "lang" VARCHAR(2),
    "commands" INTEGER NOT NULL DEFAULT 1,
    "banned" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servers" (
    "id" VARCHAR(20) NOT NULL,
    "lang" VARCHAR(2),
    "globalchat" VARCHAR(20),
    "partner" BOOLEAN,
    "banned" TEXT,

    CONSTRAINT "Servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commands" (
    "name" TEXT NOT NULL,
    "maintenance" BOOLEAN,
    "reason" TEXT,

    CONSTRAINT "Commands_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Globalchat" (
    "id" VARCHAR(20) NOT NULL,
    "guild" VARCHAR(20) NOT NULL,
    "author" VARCHAR(20) NOT NULL,
    "editcount" INTEGER NOT NULL DEFAULT 0,
    "messages" VARCHAR(40)[],

    CONSTRAINT "Globalchat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blacklist" (
    "id" VARCHAR(20) NOT NULL,
    "timeout" INTEGER,
    "warns" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id")
);
