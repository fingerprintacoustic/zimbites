ALTER TABLE `driverAssignments` ADD `currentLatitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `driverAssignments` ADD `currentLongitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `driverAssignments` ADD `lastLocationUpdate` timestamp;