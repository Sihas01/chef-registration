-- CreateTable
CREATE TABLE `admin_users` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- SeedAdminUser
INSERT INTO `admin_users` (`id`, `username`, `password_hash`)
VALUES (
    'admin-user-001',
    'admin',
    '738d27c9939cb115cbf6550efa0c46b8:19ea84e0f80f10a8e87f688a8450486070566be9bdca42b0fbb87a846d407adf35806de64c501c87b66ff061b802dd40beb5cd726ac31a03ea4b1e3f42d7c45a'
);
