CREATE TABLE IF NOT EXISTS `whatsappConversations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `waId` varchar(64) NOT NULL,
  `displayName` varchar(255),
  `phoneNumber` varchar(64),
  `lastUserMessage` text,
  `lastAssistantMessage` text,
  `status` enum('new','open','resolved') NOT NULL DEFAULT 'new',
  `isRead` boolean NOT NULL DEFAULT false,
  `needsOperator` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `whatsappConversations_id` PRIMARY KEY(`id`),
  CONSTRAINT `whatsappConversations_waId_unique` UNIQUE(`waId`)
);

CREATE TABLE IF NOT EXISTS `whatsappChatMessages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `waId` varchar(64) NOT NULL,
  `role` enum('user','assistant','admin') NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `whatsappChatMessages_id` PRIMARY KEY(`id`)
);
