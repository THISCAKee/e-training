-- Accounts created through MSU Google sign-in have no local password.
ALTER TABLE `User` MODIFY `password` VARCHAR(191) NULL;
