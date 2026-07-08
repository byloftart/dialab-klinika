CREATE TABLE IF NOT EXISTS `telegramChatMessages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `chatId` varchar(64) NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `telegramChatMessages_id` PRIMARY KEY(`id`)
);
