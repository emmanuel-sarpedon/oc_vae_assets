-- MariaDB dump 10.19  Distrib 10.11.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: frais_import
-- ------------------------------------------------------
-- Server version	10.11.6-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `Transfert`
--
-- WHERE:  1 ORDER BY tra_id DESC LIMIT 20

LOCK TABLES `Transfert` WRITE;
/*!40000 ALTER TABLE `Transfert` DISABLE KEYS */;
INSERT INTO `Transfert` VALUES
(8102,'2025-08-25 05:46:14.769',17,15907,0,'Transfert caisse du matin, Remises Commerciaux, 25/08/2025, 09:46',9437,5461,''),
(8101,'2025-08-23 08:05:14.011',1,15901,831.67,'Transfert caisse du matin, Comptoir-01, 23/08/2025, 12:03',9435,5458,''),
(8100,'2025-08-23 08:03:51.790',2,15899,190.03,'Transfert caisse du matin, Comptoir-02, 23/08/2025, 12:07',9434,5456,''),
(8099,'2025-08-23 08:00:42.678',4,15894,29.84,'Transfert caisse du matin, Plateforme-02, 23/08/2025, 12:00',9430,5457,''),
(8098,'2025-08-22 13:14:38.761',5,15887,54.17,'Transfert caisse du soir, Plateforme-01, 22/08/2025, 17:14',9428,5452,''),
(8097,'2025-08-22 13:06:39.244',2,15884,1687.5,'Transfert caisse du soir, Comptoir-02, 22/08/2025, 17:09',9426,5451,''),
(8096,'2025-08-22 11:38:48.555',1,15879,2290.85,'Transfert caisse du soir, Comptoir-01, 22/08/2025, 15:37',9422,5450,''),
(8095,'2025-08-22 10:04:52.812',6,15874,0,'Transfert caisse du soir, Retours-PF, 22/08/2025, 14:00',9418,5454,''),
(8094,'2025-08-22 06:13:05.439',16,15871,0,'Transfert caisse du matin, Retours-PLT, 22/08/2025, 10:12',9417,5453,''),
(8093,'2025-08-21 13:03:24.245',1,15865,1162.8,'Transfert caisse du soir, Comptoir-01, 21/08/2025, 17:00',9416,5445,''),
(8092,'2025-08-21 12:55:43.242',5,15862,0,'Transfert caisse du soir, Plateforme-01, 21/08/2025, 16:55',9414,5446,''),
(8091,'2025-08-21 11:54:29.668',6,15859,0,'Transfert caisse du soir, Retours-PF, 21/08/2025, 15:50',9412,5449,''),
(8090,'2025-08-21 08:59:56.123',2,15854,155.01,'Transfert caisse du matin, Comptoir-02, 21/08/2025, 12:58',9409,5447,''),
(8089,'2025-08-21 05:56:46.400',16,15851,0,'Transfert caisse du matin, Retours-PLT, 21/08/2025, 09:56',9407,5448,''),
(8088,'2025-08-20 13:04:32.164',1,15845,868.2,'Transfert caisse du soir, Comptoir-01, 20/08/2025, 17:03',9406,5444,''),
(8087,'2025-08-20 12:54:56.560',5,15841,0,'Transfert caisse du soir, Plateforme-01, 20/08/2025, 16:54',9403,5443,''),
(8086,'2025-08-20 11:28:21.923',2,15838,3247.21,'Transfert caisse du soir, Comptoir-02, 20/08/2025, 15:30',9401,5442,''),
(8085,'2025-08-19 13:00:21.222',1,15830,2730,'Transfert caisse du soir, Comptoir-01, 19/08/2025, 16:58',9397,5434,''),
(8084,'2025-08-19 12:59:36.225',17,15828,0,'Transfert caisse du soir, Remises Commerciaux, 19/08/2025, 16:59',9386,5441,''),
(8083,'2025-08-19 12:56:30.546',5,15826,5.62,'Transfert caisse du soir, Plateforme-01, 19/08/2025, 16:56',9396,5435,'');
/*!40000 ALTER TABLE `Transfert` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-25 12:33:55
