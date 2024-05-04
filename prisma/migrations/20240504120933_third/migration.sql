/*
  Warnings:

  - You are about to drop the `Posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Posts";

-- CreateTable
CREATE TABLE "Blog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);
