/*
 Deploy DB Schema Script 
 clickhouse-client --multiquery < deploy.sql
 */
DROP DATABASE IF EXISTS Stride;
CREATE DATABASE Stride;