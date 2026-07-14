CREATE DATABASE  IF NOT EXISTS `codevault` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `codevault`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: codevault
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `goals`
--

DROP TABLE IF EXISTS `goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `goals` (
  `goal_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_problems` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`goal_id`),
  KEY `fk_goals_user` (`user_id`),
  CONSTRAINT `fk_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `goals`
--

LOCK TABLES `goals` WRITE;
/*!40000 ALTER TABLE `goals` DISABLE KEYS */;
INSERT INTO `goals` VALUES (3,3,'goal 1',5,'2026-07-10','2026-07-31','2026-07-10 11:34:50');
/*!40000 ALTER TABLE `goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem_test_cases`
--

DROP TABLE IF EXISTS `problem_test_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_test_cases` (
  `test_case_id` int unsigned NOT NULL AUTO_INCREMENT,
  `problem_id` int unsigned NOT NULL,
  `input_data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `expected_output` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`test_case_id`),
  KEY `idx_test_case_problem` (`problem_id`),
  CONSTRAINT `fk_test_case_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem_test_cases`
--

LOCK TABLES `problem_test_cases` WRITE;
/*!40000 ALTER TABLE `problem_test_cases` DISABLE KEYS */;
INSERT INTO `problem_test_cases` VALUES (1,1,'4\n2 7 11 15\n9','0 1',0,'2026-07-10 11:13:01'),(2,1,'3\n3 2 4\n6','1 2',0,'2026-07-10 11:13:01'),(3,1,'2\n3 3\n6','0 1',1,'2026-07-10 11:13:01'),(4,1,'5\n1 5 8 10 15\n18','2 3',1,'2026-07-10 11:13:01'),(5,2,'6\n-1 0 3 5 9 12\n9','4',0,'2026-07-10 11:45:33'),(6,2,'6\n-1 0 3 5 9 12\n2','-1',0,'2026-07-10 11:45:33'),(7,2,'1\n5\n5','0',1,'2026-07-10 11:45:33'),(8,2,'5\n1 3 5 7 9\n1','0',1,'2026-07-10 11:45:33'),(9,2,'5\n1 3 5 7 9\n9','4',1,'2026-07-10 11:45:33');
/*!40000 ALTER TABLE `problem_test_cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problem_topics`
--

DROP TABLE IF EXISTS `problem_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem_topics` (
  `problem_id` int unsigned NOT NULL,
  `topic_id` int unsigned NOT NULL,
  PRIMARY KEY (`problem_id`,`topic_id`),
  KEY `fk_problem_topics_topic` (`topic_id`),
  CONSTRAINT `fk_problem_topics_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_problem_topics_topic` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`topic_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problem_topics`
--

LOCK TABLES `problem_topics` WRITE;
/*!40000 ALTER TABLE `problem_topics` DISABLE KEYS */;
INSERT INTO `problem_topics` VALUES (1,1),(4,1),(5,1),(6,1),(7,1),(8,3),(6,7),(3,8),(4,8),(5,8),(7,8),(2,10),(7,10),(1,13),(8,14);
/*!40000 ALTER TABLE `problem_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `problems`
--

DROP TABLE IF EXISTS `problems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problems` (
  `problem_id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `problem_slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` enum('Easy','Medium','Hard') COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` enum('LeetCode','Codeforces','CodeVault') COLLATE utf8mb4_unicode_ci NOT NULL,
  `external_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text COLLATE utf8mb4_unicode_ci,
  `input_format` text COLLATE utf8mb4_unicode_ci,
  `output_format` text COLLATE utf8mb4_unicode_ci,
  `constraints` text COLLATE utf8mb4_unicode_ci,
  `starter_code` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`problem_id`),
  UNIQUE KEY `problem_slug` (`problem_slug`),
  KEY `idx_problems_difficulty` (`difficulty`),
  KEY `idx_problems_platform` (`platform`),
  KEY `idx_problems_rating` (`rating`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `problems`
--

LOCK TABLES `problems` WRITE;
/*!40000 ALTER TABLE `problems` DISABLE KEYS */;
INSERT INTO `problems` VALUES (1,'Two Sum','two-sum','Easy','LeetCode','https://leetcode.com/problems/two-sum/',800,'2026-07-08 11:34:50','Given an array of integers nums and an integer target, output the indices of two numbers whose sum equals target.','First line contains n. Second line contains n integers. Third line contains target.','Print the two zero-based indices separated by a space.','2 <= n <= 100000','#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    vector<int> nums(n);\n\n    for (int &value : nums) {\n        cin >> value;\n    }\n\n    int target;\n    cin >> target;\n\n    // Write your solution here\n\n    return 0;\n}'),(2,'Binary Search','binary-search','Easy','LeetCode','https://leetcode.com/problems/binary-search/',800,'2026-07-08 11:34:50','Given a sorted array of integers nums and an integer target, find the index of target in nums.\n\nYou must write an algorithm with O(log n) runtime complexity.\n\nIf target exists in the array, print its zero-based index. Otherwise, print -1.','The first line contains an integer n, the number of elements in the array.\n\nThe second line contains n space-separated integers in sorted ascending order.\n\nThe third line contains the integer target.','Print a single integer representing the zero-based index of target.\n\nPrint -1 if target does not exist in the array.','1 <= n <= 100000\n-1000000000 <= nums[i] <= 1000000000\nnums is sorted in ascending order\nAll elements in nums are unique\n-1000000000 <= target <= 1000000000','#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n\n    vector<int> nums(n);\n\n    for (int &value : nums) {\n        cin >> value;\n    }\n\n    int target;\n    cin >> target;\n\n    // Write your binary search solution here\n\n    return 0;\n}'),(3,'Climbing Stairs','climbing-stairs','Easy','LeetCode','https://leetcode.com/problems/climbing-stairs/',900,'2026-07-08 11:34:50',NULL,NULL,NULL,NULL,NULL),(4,'House Robber','house-robber','Medium','LeetCode','https://leetcode.com/problems/house-robber/',1200,'2026-07-08 11:34:50',NULL,NULL,NULL,NULL,NULL),(5,'Coin Change','coin-change','Medium','LeetCode','https://leetcode.com/problems/coin-change/',1400,'2026-07-08 11:34:50',NULL,NULL,NULL,NULL,NULL),(6,'Number of Islands','number-of-islands','Medium','LeetCode','https://leetcode.com/problems/number-of-islands/',1300,'2026-07-08 11:34:50',NULL,NULL,NULL,NULL,NULL),(7,'Longest Increasing Subsequence','longest-increasing-subsequence','Medium','LeetCode','https://leetcode.com/problems/longest-increasing-subsequence/',1500,'2026-07-08 11:34:50',NULL,NULL,NULL,NULL,NULL),(8,'Merge k Sorted Lists','merge-k-sorted-lists','Hard','LeetCode','https://leetcode.com/problems/merge-k-sorted-lists/',1800,'2026-07-08 11:34:50',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `problems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendations`
--

DROP TABLE IF EXISTS `recommendations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendations` (
  `recommendation_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `problem_id` int unsigned NOT NULL,
  `recommendation_score` decimal(8,4) NOT NULL,
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `generated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`recommendation_id`),
  UNIQUE KEY `unique_user_problem_recommendation` (`user_id`,`problem_id`),
  KEY `fk_recommendations_problem` (`problem_id`),
  KEY `idx_recommendations_user_score` (`user_id`,`recommendation_score`),
  CONSTRAINT `fk_recommendations_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recommendations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendations`
--

LOCK TABLES `recommendations` WRITE;
/*!40000 ALTER TABLE `recommendations` DISABLE KEYS */;
/*!40000 ALTER TABLE `recommendations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `submission_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `problem_id` int unsigned NOT NULL,
  `status` enum('Accepted','Wrong Answer','Time Limit Exceeded','Memory Limit Exceeded','Runtime Error','Compilation Error') COLLATE utf8mb4_unicode_ci NOT NULL,
  `language` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'C++',
  `execution_time_ms` int unsigned DEFAULT NULL,
  `memory_kb` int unsigned DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`submission_id`),
  KEY `idx_submissions_user` (`user_id`),
  KEY `idx_submissions_problem` (`problem_id`),
  KEY `idx_submissions_status` (`status`),
  KEY `idx_submissions_submitted_at` (`submitted_at`),
  KEY `idx_submissions_user_date` (`user_id`,`submitted_at`),
  CONSTRAINT `fk_submissions_problem` FOREIGN KEY (`problem_id`) REFERENCES `problems` (`problem_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,1,1,'Wrong Answer','C++',15,10240,'2026-07-08 13:50:39'),(2,1,1,'Accepted','C++',8,9500,'2026-07-08 13:52:34'),(3,1,3,'Accepted','C++',10,11000,'2026-07-08 13:53:50'),(4,1,4,'Wrong Answer','C++',20,12000,'2026-07-08 13:55:57'),(5,1,4,'Accepted','C++',12,10500,'2026-07-08 13:56:18'),(6,1,5,'Time Limit Exceeded','C++',2000,15000,'2026-07-08 13:56:24'),(7,1,5,'Accepted','C++',75,14000,'2026-07-08 13:56:31'),(8,1,6,'Accepted','C++',30,13000,'2026-07-08 13:56:37'),(9,3,1,'Wrong Answer','C++',120,19000,'2026-07-10 09:35:29'),(10,3,1,'Wrong Answer','C++',115,18500,'2026-07-10 09:35:42'),(11,3,2,'Accepted','C++',80,17000,'2026-07-10 09:35:57'),(12,3,4,'Accepted','C++',95,18000,'2026-07-10 09:36:06'),(13,3,2,'Wrong Answer','C++',668,0,'2026-07-10 11:46:16'),(14,3,1,'Wrong Answer','C++',789,0,'2026-07-10 11:47:10');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `topic_id` int unsigned NOT NULL AUTO_INCREMENT,
  `topic_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`topic_id`),
  UNIQUE KEY `topic_name` (`topic_name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES (1,'Arrays','Array traversal, manipulation and prefix techniques','2026-07-08 11:34:50'),(2,'Strings','String processing and pattern-based problems','2026-07-08 11:34:50'),(3,'Linked Lists','Singly and doubly linked list problems','2026-07-08 11:34:50'),(4,'Stacks','Stack-based data structure problems','2026-07-08 11:34:50'),(5,'Queues','Queue and deque based problems','2026-07-08 11:34:50'),(6,'Trees','Binary trees and general tree problems','2026-07-08 11:34:50'),(7,'Graphs','Graph traversal and graph algorithms','2026-07-08 11:34:50'),(8,'Dynamic Programming','Problems involving optimal substructure and overlapping subproblems','2026-07-08 11:34:50'),(9,'Greedy','Problems solved using locally optimal decisions','2026-07-08 11:34:50'),(10,'Binary Search','Binary search and search on answer','2026-07-08 11:34:50'),(11,'Two Pointers','Problems using two pointer techniques','2026-07-08 11:34:50'),(12,'Sliding Window','Fixed and variable sliding window problems','2026-07-08 11:34:50'),(13,'Hashing','Hash maps and hash sets','2026-07-08 11:34:50'),(14,'Heaps','Priority queue and heap problems','2026-07-08 11:34:50'),(15,'Backtracking','Recursive state-space search problems','2026-07-08 11:34:50');
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_goals`
--

DROP TABLE IF EXISTS `user_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_goals` (
  `goal_id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `topic_id` int unsigned DEFAULT NULL,
  `target_count` int unsigned NOT NULL,
  `current_count` int unsigned NOT NULL DEFAULT '0',
  `deadline` date DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`goal_id`),
  KEY `fk_user_goals_topic` (`topic_id`),
  KEY `idx_user_goals_user` (`user_id`),
  CONSTRAINT `fk_user_goals_topic` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`topic_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_user_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_goals`
--

LOCK TABLES `user_goals` WRITE;
/*!40000 ALTER TABLE `user_goals` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_goals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codeforces_handle` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leetcode_handle` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_streak` int unsigned NOT NULL DEFAULT '0',
  `longest_streak` int unsigned NOT NULL DEFAULT '0',
  `last_active_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `codeforces_handle` (`codeforces_handle`),
  UNIQUE KEY `leetcode_handle` (`leetcode_handle`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Ayush Chakole','ayush.codevault@example.com','$2b$12$D8uNZ599s67nnwOpPU.0huMGODVbU9wi4EcxgZbGEgCIiu64vbzkq',NULL,NULL,1,1,'2026-07-07','2026-07-08 12:53:41','2026-07-08 14:05:05'),(2,'CodeVault Test User','testuser.codevault@example.com','$2b$12$32kTJY9wBJf5xqq4UKO.POj1DtbCR1xSOcX4ZQMfgeWfd.O3bIoYm',NULL,NULL,1,1,'2026-07-07','2026-07-08 14:02:46','2026-07-08 14:05:18'),(3,'AYUSH CHAKOLE','chakoleayush589@gmail.com','$2b$12$l59xcNeazoPUQL7cZ66/o./5RQ3c309CROiLwA5R.aBgxx1t0A0da',NULL,NULL,1,1,'2026-07-10','2026-07-09 05:16:42','2026-07-10 09:35:57');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-10 17:36:56
