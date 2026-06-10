CREATE TABLE `driverWallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`driverId` int NOT NULL,
	`availableBalance` int NOT NULL DEFAULT 0,
	`pendingEarnings` int NOT NULL DEFAULT 0,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`totalTips` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driverWallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `driverWallets_driverId_unique` UNIQUE(`driverId`)
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`vehicleType` varchar(50) NOT NULL,
	`licensePlate` varchar(50),
	`status` enum('available','on_delivery','offline','suspended') NOT NULL DEFAULT 'offline',
	`currentLatitude` varchar(50),
	`currentLongitude` varchar(50),
	`lastLocationUpdate` timestamp,
	`isApproved` int NOT NULL DEFAULT 0,
	`totalDeliveries` int NOT NULL DEFAULT 0,
	`averageRating` varchar(10) NOT NULL DEFAULT '0.0',
	`totalEarnings` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menuCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menuCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menuItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`restaurantId` int NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`imageUrl` varchar(512),
	`isAvailable` int NOT NULL DEFAULT 1,
	`preparationTime` int NOT NULL DEFAULT 15,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menuItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`menuItemId` int NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`subtotal` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`restaurantId` int NOT NULL,
	`driverId` int,
	`orderNumber` varchar(50) NOT NULL,
	`status` enum('pending','confirmed','preparing','ready','picked_up','in_transit','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`deliveryAddress` text NOT NULL,
	`deliveryLatitude` varchar(50),
	`deliveryLongitude` varchar(50),
	`subtotal` int NOT NULL,
	`deliveryFee` int NOT NULL,
	`platformCommission` int NOT NULL,
	`tip` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`paymentMethod` varchar(50) NOT NULL,
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentReference` varchar(255),
	`specialInstructions` text,
	`estimatedDeliveryTime` timestamp,
	`pickedUpAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`amount` int NOT NULL,
	`method` varchar(50) NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`reference` varchar(255),
	`transactionId` varchar(255),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(255) NOT NULL,
	`settingValue` text NOT NULL,
	`description` text,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `platformSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`customerId` int NOT NULL,
	`restaurantId` int,
	`driverId` int,
	`rating` int NOT NULL,
	`comment` text,
	`ratedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` varchar(512),
	`address` text NOT NULL,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`phoneNumber` varchar(20),
	`deliveryRadius` int NOT NULL DEFAULT 15,
	`minOrderAmount` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`isApproved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `restaurants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`driverId` int NOT NULL,
	`customerId` int NOT NULL,
	`amount` int NOT NULL,
	`givenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tips_id` PRIMARY KEY(`id`)
);
