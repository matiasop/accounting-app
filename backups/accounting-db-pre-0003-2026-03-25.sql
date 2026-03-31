PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0000_exotic_absorbing_man.sql','2026-03-06 00:25:48');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(2,'0001_outgoing_marvel_boy.sql','2026-03-06 00:25:48');
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(3,'0002_magical_johnny_storm.sql','2026-03-12 02:36:37');
CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
, `special_role` text, `priority` integer DEFAULT 5 NOT NULL);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(1,'Income','liability',1772756748,'income',5);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(2,'Expenses','asset',1772756748,'expenses',5);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(3,'cash','asset',1772756872,NULL,7);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(4,'credit card','liability',1772756883,NULL,5);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(5,'current account','asset',1772756906,NULL,9);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(6,'digital wallets','asset',1772756917,NULL,8);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(7,'fintual','asset',1772756924,NULL,5);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(8,'racional','asset',1772756929,NULL,5);
INSERT INTO "accounts" ("id","name","type","created_at","special_role","priority") VALUES(9,'cripto','asset',1772756938,NULL,5);
CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`description` text NOT NULL,
	`credit_account_id` integer NOT NULL,
	`debit_account_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`category` text NOT NULL,
	`subcategory` text,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`credit_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`debit_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(1,'2026-03-06T00:30:00Z','balance cuenta corriente',1,5,480504,'income','refund','income',1772757058);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(2,'2026-03-06T00:46:00Z','balance billeteras digitales',1,6,2398411,'income','refund','income',1772758013);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(3,'2026-03-06T00:48:00Z','balance fintual',1,7,55427644,'income','refund','income',1772758095);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(4,'2026-03-06T00:48:00Z','balance racional',1,8,9240705,'income','refund','income',1772758124);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(5,'2026-03-06T00:49:00Z','balance cripto',1,9,4192565,'income','refund','income',1772758191);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(6,'2026-03-06T00:50:00Z','balance efectivo',1,3,4996,'income','refund','income',1772758226);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(7,'2026-03-05T13:21:00Z','psico',5,2,40000,'wellness','therapy','expense',1772803347);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(8,'2026-03-08T02:28:00Z','compras súper',5,2,43867,'food','groceries','expense',1772937068);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(9,'2026-03-08T02:31:00Z','mueble despensa ikea',5,2,21990,'housing','kitchen_items','expense',1772937108);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(10,'2026-03-08T02:31:00Z','heladito y bebida',5,2,4980,'food','restaurant','expense',1772937149);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(11,'2026-03-10T13:14:00Z','compa súper',5,2,1990,'food','groceries','expense',1773148527);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(12,'2026-03-10T13:15:00Z','cafetería',5,2,18770,'entertainment','dates','expense',1773148562);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(13,'2026-03-11T00:04:00Z','fuente suiza',5,2,13880,'food','restaurant','expense',1773187491);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(14,'2026-03-11T17:05:00Z','almuerzo lover',5,2,15990,'food','restaurant','expense',1773248779);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(15,'2026-03-11T21:13:00Z','regalo javi',5,2,4000,'entertainment','gifts','expense',1773263603);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(16,'2026-03-12T01:18:00Z','suplementos alimenticios',6,2,128090,'wellness','supplements','expense',1773278313);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(17,'2026-03-12T02:04:00Z','soda caustica',6,2,14064,'housing','bathroom_items','expense',1773281102);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(18,'2026-03-14T01:56:00Z','supermercado ',5,2,36413,'food','restaurant','expense',1773453407);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(19,'2026-03-14T01:56:00Z','cosas de simi',5,2,18000,'wellness','hygiene','expense',1773453431);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(20,'2026-03-15T23:47:00Z','chicle',5,2,4490,'food','groceries','expense',1773618495);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(21,'2026-03-15T23:49:00Z','pantalones',5,2,39990,'clothing','pants','expense',1773618572);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(22,'2026-03-16T00:35:00Z','restaurant',5,2,38500,'food','restaurant','expense',1773621334);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(23,'2026-03-16T00:36:00Z','bar',5,2,17790,'food','bars_going_out','expense',1773621404);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(24,'2026-03-16T00:36:00Z','taxi',5,2,5400,'transport','taxi','expense',1773621431);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(25,'2026-03-16T16:06:00Z','retiro mercadopago',6,5,400000,'movement','movement','movement',1773677370);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(26,'2026-03-16T16:14:00Z','prestamo mama',5,2,398417,'utilities','adjustment','expense',1773677758);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(27,'2026-03-19T00:49:00Z','gym escalada',5,2,8476,'wellness','exercise','expense',1773881368);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(28,'2026-03-19T01:23:00Z','entrada maratón concón',5,2,27678,'exercise','gym','expense',1773883465);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(29,'2026-03-19T19:50:00Z','minimarket manolo',5,2,20519,'food','groceries','expense',1773949853);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(30,'2026-03-23T12:37:00Z','compras super',5,2,47540,'food','groceries','expense',1774269536);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(31,'2026-03-23T12:39:00Z','restaurant',5,2,37070,'food','restaurant','expense',1774269583);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(32,'2026-03-23T12:39:00Z','cabify',6,2,6195,'transport','taxi','expense',1774269616);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(33,'2026-03-25T14:40:00Z','platanos',5,2,3393,'food','groceries','expense',1774453061);
INSERT INTO "entries" ("id","date","description","credit_account_id","debit_account_id","amount","category","subcategory","type","created_at") VALUES(34,'2026-03-25T15:37:00Z','pasajes iquique (mio y tomas)',6,2,381744,'entertainment','vacation','expense',1774453156);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',3);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('accounts',9);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('entries',34);
