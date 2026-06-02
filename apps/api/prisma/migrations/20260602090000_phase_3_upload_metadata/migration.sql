-- AlterTable
ALTER TABLE `documents`
    ADD COLUMN `instructor_name` VARCHAR(191) NULL,
    ADD COLUMN `term_label` VARCHAR(191) NULL,
    ADD COLUMN `exam_name` VARCHAR(191) NULL,
    ADD COLUMN `tags` JSON NULL;
