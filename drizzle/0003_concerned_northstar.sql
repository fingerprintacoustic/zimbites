CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int NOT NULL,
	`menuItemId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`price` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carts_id` PRIMARY KEY(`id`),
	CONSTRAINT `carts_customerId_unique` UNIQUE(`customerId`)
);
--> statement-breakpoint
CREATE TABLE `driverAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`driverId` int NOT NULL,
	`status` enum('pending','accepted','rejected','completed') NOT NULL DEFAULT 'pending',
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`pickedUpAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `driverAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('order','delivery','promo','system') NOT NULL DEFAULT 'system',
	`isRead` int NOT NULL DEFAULT 0,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` varchar(50) NOT NULL,
	`notes` text,
	`createdBy` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `status` enum('pending','accepted','preparing','ready_for_pickup','driver_assigned','picked_up','out_for_delivery','delivered','customer_confirmed','cancelled','rejected','refunded') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orderItems` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryNotes` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `tax` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `discount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `imageUrl` varchar(512);--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `specialInstructions`;