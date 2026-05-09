-- CreateTable
CREATE TABLE `registrations` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `surname` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `mobile_number` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `student_email` VARCHAR(191) NOT NULL,
    `fee_status` VARCHAR(191) NOT NULL,
    `help_loan_amount` DECIMAL(10,2) NULL,
    `receipt_storage_path` VARCHAR(191) NULL,
    `receipt_file_name` VARCHAR(191) NULL,
    `receipt_content_type` VARCHAR(191) NULL,
    `consent_accepted` BOOLEAN NOT NULL DEFAULT true,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
