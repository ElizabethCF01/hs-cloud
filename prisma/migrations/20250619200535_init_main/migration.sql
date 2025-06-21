/*
  Warnings:

  - You are about to drop the `Shift` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Shift` DROP FOREIGN KEY `Shift_requestId_fkey`;

-- DropTable
DROP TABLE `Shift`;
