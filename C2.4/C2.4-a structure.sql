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
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Caisse`
--

DROP TABLE IF EXISTS `Caisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Caisse` (
  `cai_id` int(11) NOT NULL AUTO_INCREMENT,
  `cai_nom` varchar(191) NOT NULL,
  `cai_desactive` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`cai_id`),
  UNIQUE KEY `Caisse_cai_nom_key` (`cai_nom`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CaissesUtilisateurs`
--

DROP TABLE IF EXISTS `CaissesUtilisateurs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CaissesUtilisateurs` (
  `caisse_id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  PRIMARY KEY (`caisse_id`,`utilisateur_id`),
  KEY `CaissesUtilisateurs_utilisateur_id_fkey` (`utilisateur_id`),
  CONSTRAINT `CaissesUtilisateurs_caisse_id_fkey` FOREIGN KEY (`caisse_id`) REFERENCES `Caisse` (`cai_id`) ON UPDATE CASCADE,
  CONSTRAINT `CaissesUtilisateurs_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `Utilisateur` (`uti_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ControleCaisse`
--

DROP TABLE IF EXISTS `ControleCaisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ControleCaisse` (
  `cca_id` int(11) NOT NULL AUTO_INCREMENT,
  `cca_coupure_id` int(11) DEFAULT NULL,
  `cca_caisse_id` int(11) NOT NULL,
  `cca_date` datetime(3) NOT NULL,
  `cca_montant` double NOT NULL,
  `cca_transfere` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`cca_id`),
  KEY `ControleCaisse_cca_caisse_id_fkey` (`cca_caisse_id`),
  KEY `ControleCaisse_cca_coupure_id_fkey` (`cca_coupure_id`),
  CONSTRAINT `ControleCaisse_cca_caisse_id_fkey` FOREIGN KEY (`cca_caisse_id`) REFERENCES `Caisse` (`cai_id`) ON UPDATE CASCADE,
  CONSTRAINT `ControleCaisse_cca_coupure_id_fkey` FOREIGN KEY (`cca_coupure_id`) REFERENCES `Coupure` (`cou_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9438 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Coupure`
--

DROP TABLE IF EXISTS `Coupure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Coupure` (
  `cou_id` int(11) NOT NULL AUTO_INCREMENT,
  `cou_500` int(10) unsigned DEFAULT NULL,
  `cou_200` int(10) unsigned DEFAULT NULL,
  `cou_100` int(10) unsigned DEFAULT NULL,
  `cou_50` int(10) unsigned DEFAULT NULL,
  `cou_20` int(10) unsigned DEFAULT NULL,
  `cou_10` int(10) unsigned DEFAULT NULL,
  `cou_5` int(10) unsigned DEFAULT NULL,
  `cou_2` int(10) unsigned DEFAULT NULL,
  `cou_1` int(10) unsigned DEFAULT NULL,
  `cou_0_50` int(10) unsigned DEFAULT NULL,
  `cou_0_20` int(10) unsigned DEFAULT NULL,
  `cou_0_10` int(10) unsigned DEFAULT NULL,
  `cou_0_05` int(10) unsigned DEFAULT NULL,
  `cou_0_02` int(10) unsigned DEFAULT NULL,
  `cou_0_01` int(10) unsigned DEFAULT NULL,
  `cou_montant` double DEFAULT NULL,
  PRIMARY KEY (`cou_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15909 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FondDeCaisse`
--

DROP TABLE IF EXISTS `FondDeCaisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FondDeCaisse` (
  `fdc_id` int(11) NOT NULL AUTO_INCREMENT,
  `fdc_caisse_id` int(11) NOT NULL,
  `fdc_montant` double NOT NULL,
  `fdc_date` datetime(3) NOT NULL,
  `fdc_coupure_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`fdc_id`),
  KEY `FondDeCaisse_fdc_caisse_id_fkey` (`fdc_caisse_id`),
  KEY `FondDeCaisse_fdc_coupure_id_fkey` (`fdc_coupure_id`),
  CONSTRAINT `FondDeCaisse_fdc_caisse_id_fkey` FOREIGN KEY (`fdc_caisse_id`) REFERENCES `Caisse` (`cai_id`) ON UPDATE CASCADE,
  CONSTRAINT `FondDeCaisse_fdc_coupure_id_fkey` FOREIGN KEY (`fdc_coupure_id`) REFERENCES `Coupure` (`cou_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5463 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Operation`
--

DROP TABLE IF EXISTS `Operation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Operation` (
  `ope_id` int(11) NOT NULL AUTO_INCREMENT,
  `ope_type` enum('CHEQUES','CB','ESPECES','SORTIE','VIREMENT','TRAITES','HORZ') NOT NULL,
  `ope_caisse_id` int(11) NOT NULL,
  `ope_client_id` varchar(191) DEFAULT NULL,
  `ope_client_nom` varchar(191) DEFAULT NULL,
  `ope_client_tel` varchar(191) DEFAULT NULL,
  `ope_facture` varchar(191) DEFAULT NULL,
  `ope_montant` double NOT NULL,
  `ope_note` varchar(2000) DEFAULT NULL,
  `ope_transfere` tinyint(1) DEFAULT 0,
  `ope_hors_z` tinyint(1) DEFAULT NULL,
  `ope_transfert_id` int(11) DEFAULT NULL,
  `ope_canceled` tinyint(1) DEFAULT 0,
  `ope_canceled_at` datetime(3) DEFAULT NULL,
  `ope_canceled_by_id` int(11) DEFAULT NULL,
  `ope_created_at` datetime(3) DEFAULT current_timestamp(3),
  `ope_created_by_id` int(11) DEFAULT NULL,
  `ope_updated_at` datetime(3) DEFAULT NULL,
  `ope_updated_by_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`ope_id`),
  KEY `Operation_ope_caisse_id_fkey` (`ope_caisse_id`),
  KEY `Operation_ope_transfert_id_fkey` (`ope_transfert_id`),
  KEY `Operation_ope_created_by_id_fkey` (`ope_created_by_id`),
  KEY `Operation_ope_updated_by_id_fkey` (`ope_updated_by_id`),
  KEY `Operation_ope_canceled_by_id_fkey` (`ope_canceled_by_id`),
  CONSTRAINT `Operation_ope_caisse_id_fkey` FOREIGN KEY (`ope_caisse_id`) REFERENCES `Caisse` (`cai_id`) ON UPDATE CASCADE,
  CONSTRAINT `Operation_ope_canceled_by_id_fkey` FOREIGN KEY (`ope_canceled_by_id`) REFERENCES `Utilisateur` (`uti_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Operation_ope_created_by_id_fkey` FOREIGN KEY (`ope_created_by_id`) REFERENCES `Utilisateur` (`uti_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Operation_ope_transfert_id_fkey` FOREIGN KEY (`ope_transfert_id`) REFERENCES `Transfert` (`tra_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Operation_ope_updated_by_id_fkey` FOREIGN KEY (`ope_updated_by_id`) REFERENCES `Utilisateur` (`uti_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=160098 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Transfert`
--

DROP TABLE IF EXISTS `Transfert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Transfert` (
  `tra_id` int(11) NOT NULL AUTO_INCREMENT,
  `tra_date` datetime(3) NOT NULL,
  `tra_caisse_id` int(11) NOT NULL,
  `tra_coupure_id` int(11) NOT NULL,
  `tra_montant` double NOT NULL,
  `tra_nom` varchar(191) DEFAULT NULL,
  `tra_controle_caisse_id` int(11) DEFAULT NULL,
  `tra_fond_de_caisse_id` int(11) DEFAULT NULL,
  `tra_note` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`tra_id`),
  KEY `Transfert_tra_caisse_id_fkey` (`tra_caisse_id`),
  KEY `Transfert_tra_coupure_id_fkey` (`tra_coupure_id`),
  KEY `Transfert_tra_controle_caisse_id_fkey` (`tra_controle_caisse_id`),
  KEY `Transfert_tra_fond_de_caisse_id_fkey` (`tra_fond_de_caisse_id`),
  CONSTRAINT `Transfert_tra_caisse_id_fkey` FOREIGN KEY (`tra_caisse_id`) REFERENCES `Caisse` (`cai_id`) ON UPDATE CASCADE,
  CONSTRAINT `Transfert_tra_controle_caisse_id_fkey` FOREIGN KEY (`tra_controle_caisse_id`) REFERENCES `ControleCaisse` (`cca_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Transfert_tra_coupure_id_fkey` FOREIGN KEY (`tra_coupure_id`) REFERENCES `Coupure` (`cou_id`) ON UPDATE CASCADE,
  CONSTRAINT `Transfert_tra_fond_de_caisse_id_fkey` FOREIGN KEY (`tra_fond_de_caisse_id`) REFERENCES `FondDeCaisse` (`fdc_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Utilisateur`
--

DROP TABLE IF EXISTS `Utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Utilisateur` (
  `uti_id` int(11) NOT NULL AUTO_INCREMENT,
  `uti_identifiant` varchar(191) NOT NULL,
  `uti_salt` varchar(191) NOT NULL,
  `uti_admin` tinyint(1) NOT NULL DEFAULT 0,
  `uti_comptable` tinyint(1) NOT NULL DEFAULT 0,
  `uti_mot_de_passe` varchar(191) NOT NULL,
  `uti_superviseur` tinyint(1) NOT NULL DEFAULT 0,
  `uti_prenom` varchar(191) DEFAULT NULL,
  `uti_nom` varchar(191) DEFAULT NULL,
  `uti_desactive` tinyint(1) NOT NULL DEFAULT 0,
  `uti_email` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`uti_id`),
  UNIQUE KEY `Utilisateur_uti_identifiant_key` (`uti_identifiant`),
  UNIQUE KEY `Utilisateur_uti_email_key` (`uti_email`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-25 12:27:22
