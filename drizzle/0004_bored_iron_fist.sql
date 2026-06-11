ALTER TABLE `driverAssignments` MODIFY COLUMN `status` enum('pending','accepted','picked_up','completed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `cartItems` ADD `currency` enum('USD','ZWL') DEFAULT 'ZWL' NOT NULL;--> statement-breakpoint
ALTER TABLE `menuItems` ADD `currency` enum('USD','ZWL') DEFAULT 'ZWL' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `currency` enum('USD','ZWL') DEFAULT 'ZWL' NOT NULL;