/*
  Warnings:

  - You are about to drop the column `viewCounter` on the `ContentElement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ContentElement` DROP COLUMN `viewCounter`;

-- CreateTable
CREATE TABLE `UserMCAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `answerId` INTEGER NOT NULL,
    `answerText` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserMCAnswer` ADD CONSTRAINT `UserMCAnswer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMCAnswer` ADD CONSTRAINT `UserMCAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `MCQuestion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserMCAnswer` ADD CONSTRAINT `UserMCAnswer_answerId_fkey` FOREIGN KEY (`answerId`) REFERENCES `MCAnswer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
