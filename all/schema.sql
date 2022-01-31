DROP DATABASE IF EXISTS food_app;
CREATE DATABASE  food_app;
USE food_app ;


DROP TABLE IF EXISTS users;
CREATE TABLE users(
user_id INT AUTO_INCREMENT,
first_name VARCHAR(30),
last_name VARCHAR(30),
email VARCHAR(30),
pass VARCHAR(250),
phone_no VARCHAR(10),
default_address VARCHAR(255),
PRIMARY KEY(user_id)
);


DROP TABLE IF EXISTS admins;
CREATE TABLE admins(
admin_id INT AUTO_INCREMENT,
email VARCHAR(30),
pass VARCHAR(30),
PRIMARY KEY(admin_id)
);

 DROP TABLE IF EXISTS order_status;
 CREATE TABLE order_status (
 status_id INT AUTO_INCREMENT,
 status_name VARCHAR(30),
 PRIMARY KEY(status_id)
 );

DROP TABLE IF EXISTS pay_methods;
 CREATE TABLE pay_methods (
 method_id INT AUTO_INCREMENT,
 method_name VARCHAR(30) CHECK (method_name IN ('Online','COD')),
 PRIMARY KEY(method_id)
 );
 
DROP TABLE IF EXISTS orders;
CREATE TABLE orders(
order_id INT AUTO_INCREMENT NOT NULL,
user_id INT NOT NULL,
status_id INT DEFAULT 1,
method_id INT,
total_price INT,
date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
delivery_address VARCHAR(255),
phone_no VARCHAR(10),
PRIMARY KEY(order_id),
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (status_id) REFERENCES order_status(status_id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (method_id) REFERENCES pay_methods(method_id) ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE IF EXISTS categories;
CREATE TABLE categories(
category_id INT AUTO_INCREMENT,
category_name VARCHAR(30),
PRIMARY KEY(category_id)
);

 DROP TABLE IF EXISTS foods;
CREATE TABLE foods(
food_id INT,
category_id INT,
food_name VARCHAR(30),
food_type INT CHECK (food_type IN (0,1)), 
unit_price INT,
food_status INT CHECK (food_status IN (0,1)),
PRIMARY KEY(food_id),
FOREIGN KEY(category_id) REFERENCES categories(category_id) ON DELETE CASCADE ON UPDATE CASCADE
);


DROP TABLE IF EXISTS order_food_items;
CREATE TABLE order_food_items(
item_id INT AUTO_INCREMENT,
order_id INT,
food_id INT,
quantity INT,
item_price INT,
PRIMARY KEY(item_id),
FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (food_id) REFERENCES foods(food_id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- DROP TABLE IF EXISTS Restaurant;
-- CREATE TABLE Restaurant(
-- resto_id INT AUTO_INCREMENT,
-- resto_name VARCHAR(30),
-- city INT,
-- status VARCHAR(30),
-- PRIMARY KEY(resto_id),
-- FOREIGN KEY(city) REFERENCES Cities(city_id) ON DELETE CASCADE ON UPDATE CASCADE
-- );
show tables;