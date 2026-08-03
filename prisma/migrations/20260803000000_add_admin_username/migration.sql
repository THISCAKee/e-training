ALTER TABLE `User` ADD COLUMN `username` VARCHAR(191) NULL;

UPDATE `User`
SET `username` = 'admin'
WHERE `role` = 'ADMIN';

CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
