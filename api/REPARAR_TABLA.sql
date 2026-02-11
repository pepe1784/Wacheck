-- Script para reparar/actualizar la tabla users
-- Ejecutar en phpMyAdmin (http://localhost/phpmyadmin)

-- OPCIÓN 1: Si la tabla no existe o quieres empezar de cero
DROP TABLE IF EXISTS users;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `special_coins` int(11) NOT NULL DEFAULT 0,
  `unlocked_defenders` TEXT DEFAULT NULL,
  `calculator_completed` tinyint(1) NOT NULL DEFAULT 0,
  `rewards_data` TEXT DEFAULT NULL,
  `achievements_data` TEXT DEFAULT NULL,
  `story_progress` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OPCIÓN 2: Si la tabla existe pero con nombres incorrectos (ejecutar solo si es necesario)
-- ALTER TABLE users CHANGE COLUMN `name` `username` varchar(50) NOT NULL;
-- ALTER TABLE users CHANGE COLUMN `specialCoins` `special_coins` int(11) NOT NULL DEFAULT 0;
-- ALTER TABLE users CHANGE COLUMN `unlockedDefenders` `unlocked_defenders` TEXT DEFAULT NULL;
-- ALTER TABLE users CHANGE COLUMN `calculatorCompleted` `calculator_completed` tinyint(1) NOT NULL DEFAULT 0;
-- ALTER TABLE users CHANGE COLUMN `rewardsData` `rewards_data` TEXT DEFAULT NULL;
-- ALTER TABLE users CHANGE COLUMN `achievementsData` `achievements_data` TEXT DEFAULT NULL;
-- ALTER TABLE users CHANGE COLUMN `storyProgress` `story_progress` TEXT DEFAULT NULL;
-- ALTER TABLE users CHANGE COLUMN `createdAt` `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE users CHANGE COLUMN `updatedAt` `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
