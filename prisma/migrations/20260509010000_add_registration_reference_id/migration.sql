-- AddColumn
ALTER TABLE `registrations` ADD COLUMN `reference_id` VARCHAR(191) NULL;

-- Backfill existing rows with a readable reference generated from the UUID.
UPDATE `registrations`
SET `reference_id` = CONCAT('CHEFS-2026-', UPPER(SUBSTRING(REPLACE(`id`, '-', ''), 1, 8)))
WHERE `reference_id` IS NULL;

-- AlterColumn
ALTER TABLE `registrations` MODIFY `reference_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `registrations_reference_id_key` ON `registrations`(`reference_id`);
