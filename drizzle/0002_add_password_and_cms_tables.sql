-- Migration: Add passwordHash to users and create CMS tables
-- Add passwordHash column to users table
ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255);
--> statement-breakpoint

-- Create doctors table
CREATE TABLE IF NOT EXISTS `doctors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameAz` varchar(255) NOT NULL,
	`specialtyAz` varchar(255) NOT NULL,
	`bioAz` text,
	`photoUrl` varchar(512),
	`experienceYears` int DEFAULT 0,
	`order` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- Create galleryImages table
CREATE TABLE IF NOT EXISTS `galleryImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` varchar(512) NOT NULL,
	`titleAz` varchar(255),
	`descriptionAz` text,
	`category` varchar(100) DEFAULT 'general',
	`order` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `galleryImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- Create appointments table
CREATE TABLE IF NOT EXISTS `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`appointmentDate` varchar(20),
	`appointmentTime` varchar(10),
	`serviceType` varchar(255),
	`notes` text,
	`status` enum('new','confirmed','completed','cancelled') NOT NULL DEFAULT 'new',
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- Create feedbackMessages table
CREATE TABLE IF NOT EXISTS `feedbackMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`subject` varchar(255),
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`status` enum('new','read','replied') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbackMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint

-- Create siteSettings table
CREATE TABLE IF NOT EXISTS `siteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text,
	`label` varchar(255),
	`group` varchar(100) DEFAULT 'general',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteSettings_key_unique` UNIQUE(`key`)
);
