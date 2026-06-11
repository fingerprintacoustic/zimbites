CREATE TABLE `payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int,
	`driverId` int,
	`amount` int NOT NULL,
	`currency` enum('USD','ZWL') NOT NULL DEFAULT 'ZWL',
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`payoutMethod` enum('bank_transfer','mobile_money','cash') NOT NULL DEFAULT 'bank_transfer',
	`reference` varchar(255),
	`notes` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `driverWallets` ADD `withdrawalMethod` enum('bank_transfer','mobile_money','cash') DEFAULT 'bank_transfer' NOT NULL;--> statement-breakpoint
ALTER TABLE `drivers` ADD `walletBalance` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `drivers` ADD `bankAccountName` varchar(255);--> statement-breakpoint
ALTER TABLE `drivers` ADD `bankAccountNumber` varchar(255);--> statement-breakpoint
ALTER TABLE `drivers` ADD `bankName` varchar(255);--> statement-breakpoint
ALTER TABLE `drivers` ADD `bankBranch` varchar(255);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `bankAccountName` varchar(255);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `bankAccountNumber` varchar(255);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `bankName` varchar(255);--> statement-breakpoint
ALTER TABLE `restaurants` ADD `bankBranch` varchar(255);