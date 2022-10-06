CREATE DATABASE IF NOT EXISTS `twitter` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `twitter`;
CREATE TABLE `tweet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) DEFAULT NULL,
  `user` varchar(50) DEFAULT NULL,
  `text` varchar(360) DEFAULT NULL,
  `date` varchar(20) DEFAULT NULL,
  ADD PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;