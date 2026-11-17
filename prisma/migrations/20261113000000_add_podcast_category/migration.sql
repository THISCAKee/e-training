-- AlterTable
ALTER TABLE `Podcast` ADD COLUMN `category` VARCHAR(100) NULL;

-- CreateIndex
CREATE INDEX `Podcast_category_idx` ON `Podcast`(`category`);
