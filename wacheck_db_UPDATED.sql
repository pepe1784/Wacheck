-- phpMyAdmin SQL Dump - ACTUALIZADO PARA INFINITYFREE
-- Base de datos: wacheck_db
-- INCLUYE: Sistema de Rewards, Achievements, Story Mode
-- Fecha de actualización: 2025-10-06

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Estructura de tabla para la tabla `users` (ACTUALIZADA)
--

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users` (TUS USUARIOS EXISTENTES)
--

INSERT INTO `users` (`id`, `username`, `special_coins`, `unlocked_defenders`, `password`, `calculator_completed`, `rewards_data`, `achievements_data`, `story_progress`, `created_at`, `updated_at`) VALUES
(1, 'pepe', 60, '[\"filter\",\"plant\",\"recycler\",\"cleaner\"]', '', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31'),
(3, 'pepe1', 60, '[\"filter\",\"plant\",\"recycler\",\"cleaner\"]', '', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31'),
(4, 'pepe2', 60, '[\"filter\",\"plant\",\"recycler\",\"cleaner\"]', '', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31'),
(5, 'pepe3', 60, '[\"filter\",\"plant\",\"recycler\",\"cleaner\"]', '', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31'),
(6, 'pepe123', 15, '[\"filter\",\"plant\",\"recycler\",\"cleaner\",\"mortar\",\"generator\",\"cryomancer\",\"incinerator\",\"dualcannon\",\"whale\",\"tornado\",\"shield\",\"coral\",\"solar\",\"amplifier\",\"stream\",\"bubble\"]', '$2y$10$wLth/ZYPtshvvU2Voajbu.IrGL8gbodKXI/xkT4HuIba45YYQHOai', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31'),
(7, 'pepe456', 60, '[\"filter\",\"plant\",\"recycler\",\"cleaner\"]', '$2y$10$gMGSQCNzJ9qxcfjWz8uBU.2URld04geqay4Nvx85KaTUH5ZXc.kqS', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31'),
(8, 'pepe789', 60, '[\"filter\",\"plant\",\"recycler\",\"cleaner\"]', '$2y$10$t1Hy5BoDlJBq1WkbttwkB.1FeZ4.cVbfqjGwdVzxakf1UzpWGx6RK', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31'),
(9, 'pepe999', 60, '[\"filter\",\"plant\",\"recycler\",\"cleaner\"]', '$2y$10$z/nR4rWUf/1fSns.RAkrE.4ExaxKqqGLVYS7Zcgpj.Xqn35gAw5s6', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31'),
(10, 'pepe1234', 60, '[\"filter\",\"plant\",\"recycler\",\"cleaner\"]', '$2y$10$Aeze5pdiAFgN9q/kgTBf.ejxVu0CGq6pc3VaUa19TBVQQ5OyqLe/2', 0, NULL, NULL, NULL, '2025-09-28 20:27:31', '2025-09-28 20:27:31');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
