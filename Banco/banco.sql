-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema saep_2024
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema saep_2024
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `saep_2024` DEFAULT CHARACTER SET utf8 ;
USE `saep_2024` ;

-- -----------------------------------------------------
-- Table `saep_2024`.`professor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saep_2024`.`professor` (
  `idprofessor` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(200) NOT NULL,
  `senha` VARCHAR(30) NOT NULL,
  `nome` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`idprofessor`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `saep_2024`.`turma`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saep_2024`.`turma` (
  `idturma` INT NOT NULL AUTO_INCREMENT,
  `descricao_turma` VARCHAR(200) NOT NULL,
  `professor_idprofessor` INT NOT NULL,
  PRIMARY KEY (`idturma`),
  INDEX `fk_turma_professor_idx` (`professor_idprofessor` ASC) VISIBLE,
  CONSTRAINT `fk_turma_professor`
    FOREIGN KEY (`professor_idprofessor`)
    REFERENCES `saep_2024`.`professor` (`idprofessor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `saep_2024`.`atividade`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `saep_2024`.`atividade` (
  `idatividade` INT NOT NULL AUTO_INCREMENT,
  `descricao_atividade` VARCHAR(200) NOT NULL,
  `turma_idturma` INT NOT NULL,
  PRIMARY KEY (`idatividade`),
  INDEX `fk_atividade_turma1_idx` (`turma_idturma` ASC) VISIBLE,
  CONSTRAINT `fk_atividade_turma1`
    FOREIGN KEY (`turma_idturma`)
    REFERENCES `saep_2024`.`turma` (`idturma`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


INSERT INTO professor (email, senha, nome) VALUES ('professor1@dominio.com', 'professor1@saep', 'Professor um');
INSERT INTO professor (email, senha, nome) VALUES ('professor2@dominio.com', 'professor2@saep', 'Professor dois');
INSERT INTO professor (email, senha, nome) VALUES ('professor3@dominio.com', 'professor3@saep', 'Professor tres');

INSERT INTO turma (descricao_turma, professor_idprofessor) VALUES ('Desenvolvimento de sistemas SA01', '1');
INSERT INTO turma (descricao_turma, professor_idprofessor) VALUES ('Desenvolvimento WEB SA01', '1');
INSERT INTO turma (descricao_turma, professor_idprofessor) VALUES ('Desenvolvimento WEB SA01', '2');

INSERT INTO atividade (descricao_atividade, turma_idturma) VALUES ('Lógica de programação - condicionais', '1');
INSERT INTO atividade (descricao_atividade, turma_idturma) VALUES ('Lógica de programação - laço de repetição', '1');
INSERT INTO atividade (descricao_atividade, turma_idturma) VALUES ('Lista de atividade', '2');

