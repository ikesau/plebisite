CREATE TABLE `users` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(60) NOT NULL,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`)
);


CREATE TABLE `subreddits` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30),
    `description` VARCHAR(200) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
);


CREATE TABLE `posts` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(300) DEFAULT NULL,
    `url` varchar(2000) DEFAULT NULL,
    `userId` int(11) DEFAULT NULL,
    `subredditId` int(11) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    KEY `userId` (`userId`),
    KEY `subredditId` (`subredditId`),
    CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `subreddits_ibfk_1` FOREIGN KEY (`subredditId`) REFERENCES `subreddits` (`id`) ON DELETE SET NULL
);


CREATE TABLE `comments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `content` text,
    `userId` int(11) DEFAULT NULL,
    `postId` int(11) DEFAULT NULL,
    `parentId`int(11) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `user_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `posts_ibfk_3` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`),
    CONSTRAINT `parent_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`)
);


CREATE TABLE `votes` (
    `userId` int(11) NOT NULL,
    `postId` int(11) NOT NULL,
    `vote` TINYINT(1) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`userId`, `postId`),
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    FOREIGN KEY (`postId`) REFERENCES `posts` (`id`)
);