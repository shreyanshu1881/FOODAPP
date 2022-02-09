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
phone_no VARCHAR(12),
default_address VARCHAR(255),
u_role VARCHAR(10) DEFAULT 'customer',
PRIMARY KEY(user_id)
);


-- DROP TABLE IF EXISTS admins;
-- CREATE TABLE admins(
-- admin_id INT AUTO_INCREMENT,
-- email VARCHAR(30),
-- pass VARCHAR(30),
-- PRIMARY KEY(admin_id)
-- );

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
order_status VARCHAR(30) DEFAULT 'PLACED',
payment_type VARCHAR(30) CHECK (payment_type IN ('online','cod')) DEFAULT 'cod',
total_price INT,
date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
delivery_address VARCHAR(255),
customer_name VARCHAR(50),
payment_status VARCHAR(30) CHECK (payment_status IN ('paid','not-paid')) DEFAULT 'not-paid', 
phone_no VARCHAR(12),
PRIMARY KEY(order_id),
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- DROP TABLE IF EXISTS categories;
-- CREATE TABLE categories(
-- category_id INT AUTO_INCREMENT,
-- category_name VARCHAR(30),
-- PRIMARY KEY(category_id)
-- );

 DROP TABLE IF EXISTS foods;
CREATE TABLE foods(
food_id INT AUTO_INCREMENT,
category VARCHAR(30),
food_name VARCHAR(30),
food_type VARCHAR(30), 
img_url VARCHAR(300),
unit_price INT,
food_status INT CHECK (food_status IN (0,1)) DEFAULT 1,
PRIMARY KEY(food_id)
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
-- show tables;

-- INSERTING VALUES
-- INSERTINg CATEGORIES

-- insert into categories (category_id,category_name) values (1,'starter');
-- insert into categories (category_id,category_name) values (2,'fast_food');
-- insert into categories (category_id,category_name) values (3,'main_course');



-- INSERT IN FOODS TABLE
insert into foods (category, food_name, food_type, unit_price, food_status) values ('starter', 'Rilutek', 'veg', 58, 1);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('main-course', 'Dutoprol', 'veg', 60, 0);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('starter', 'Levocarnitine', 'veg', 16, 0);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('main-course', 'Rasuvo', 'veg', 44, 1);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('starter', 'Citalopram', 'veg', 70, 1);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('main-course', 'temazepam', 'veg', 37, 1);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('starter', 'PHYTOLACCA', 'veg', 4, 1);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('starter', 'Oxygen', 'veg', 39, 0);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('starter', 'Trihexyphenidyl Hydrochloride', 'veg', 92, 0);
insert into foods (category, food_name, food_type, unit_price, food_status) values ('starter', 'triamcinolone acetonide', 'veg', 47, 1);


