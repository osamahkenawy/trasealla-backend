-- Select database
USE trasealla_db;

-- Create airports table
CREATE TABLE IF NOT EXISTS airports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    country VARCHAR(255) NOT NULL,
    country_code VARCHAR(2),
    timezone VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_country (country),
    INDEX idx_country_code (country_code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create airport_groups table for grouping airports by country
CREATE TABLE IF NOT EXISTS airport_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country VARCHAR(255) NOT NULL UNIQUE,
    country_code VARCHAR(2),
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_country (country),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

