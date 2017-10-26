-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 03, 2017 at 08:38 PM
-- Server version: 10.1.21-MariaDB
-- PHP Version: 5.6.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sail`
--

-- --------------------------------------------------------

--
-- Table structure for table `boat`
--

CREATE TABLE `boat` (
  `IDBOAT` int(11) NOT NULL,
  `NAME` varchar(20) NOT NULL,
  `FIEVENT` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `capacity`
--

CREATE TABLE `capacity` (
  `FIBOAT` int(11) NOT NULL,
  `FIJOB` int(11) NOT NULL,
  `CAPACITY` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `IDEVENT` int(11) NOT NULL,
  `NAME` varchar(30) NOT NULL,
  `DATE` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `job`
--

CREATE TABLE `job` (
  `IDJOB` int(11) NOT NULL,
  `TITLE` varchar(20) NOT NULL,
  `SYMBOL` varchar(50) NOT NULL,
  `POSITION` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `job`
--

INSERT INTO `job` (`IDJOB`, `TITLE`, `SYMBOL`, `POSITION`) VALUES
(1, 'Skipper', 'fa-ship', 1),
(2, 'Co-Skipper', 'fa-anchor', 2),
(3, 'Crew', 'fa-life-ring', 3);

-- --------------------------------------------------------

--
-- Table structure for table `person`
--

CREATE TABLE `person` (
  `IDPERSON` int(11) NOT NULL,
  `FIRSTNAME` varchar(20) NOT NULL,
  `LASTNAME` varchar(20) NOT NULL,
  `FIJOB` int(11) NOT NULL,
  `FIBOAT` int(11) DEFAULT NULL,
  `FIEVENT` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `boat`
--
ALTER TABLE `boat`
  ADD PRIMARY KEY (`IDBOAT`),
  ADD KEY `FIEVENT` (`FIEVENT`);

--
-- Indexes for table `capacity`
--
ALTER TABLE `capacity`
  ADD PRIMARY KEY (`FIBOAT`,`FIJOB`),
  ADD KEY `FIJOB` (`FIJOB`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`IDEVENT`);

--
-- Indexes for table `job`
--
ALTER TABLE `job`
  ADD PRIMARY KEY (`IDJOB`),
  ADD UNIQUE KEY `TITLE` (`TITLE`);

--
-- Indexes for table `person`
--
ALTER TABLE `person`
  ADD PRIMARY KEY (`IDPERSON`),
  ADD KEY `FIJOB` (`FIJOB`),
  ADD KEY `FICREW` (`FIBOAT`),
  ADD KEY `FIEVENT` (`FIEVENT`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `boat`
--
ALTER TABLE `boat`
  MODIFY `IDBOAT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `IDEVENT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;
--
-- AUTO_INCREMENT for table `job`
--
ALTER TABLE `job`
  MODIFY `IDJOB` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `person`
--
ALTER TABLE `person`
  MODIFY `IDPERSON` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=191;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `boat`
--
ALTER TABLE `boat`
  ADD CONSTRAINT `boat_ibfk_1` FOREIGN KEY (`FIEVENT`) REFERENCES `event` (`IDEVENT`) ON DELETE CASCADE;

--
-- Constraints for table `capacity`
--
ALTER TABLE `capacity`
  ADD CONSTRAINT `capacity_ibfk_1` FOREIGN KEY (`FIJOB`) REFERENCES `job` (`IDJOB`),
  ADD CONSTRAINT `capacity_ibfk_2` FOREIGN KEY (`FIBOAT`) REFERENCES `boat` (`IDBOAT`) ON DELETE CASCADE;

--
-- Constraints for table `person`
--
ALTER TABLE `person`
  ADD CONSTRAINT `person_ibfk_1` FOREIGN KEY (`FIJOB`) REFERENCES `job` (`IDJOB`),
  ADD CONSTRAINT `person_ibfk_4` FOREIGN KEY (`FIBOAT`) REFERENCES `boat` (`IDBOAT`) ON DELETE SET NULL,
  ADD CONSTRAINT `person_ibfk_5` FOREIGN KEY (`FIEVENT`) REFERENCES `event` (`IDEVENT`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
