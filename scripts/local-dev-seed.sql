BEGIN TRANSACTION;

DELETE FROM entries;
DELETE FROM accounts;

DELETE FROM sqlite_sequence WHERE name IN ('accounts', 'entries');

INSERT INTO accounts (name, type, priority, special_role)
VALUES
	('Income', 'liability', 5, 'income'),
	('Expenses', 'asset', 5, 'expenses'),
	('Checking Account', 'asset', 10, NULL),
	('Cash Wallet', 'asset', 9, NULL),
	('Savings Account', 'asset', 8, NULL),
	('Visa Card', 'liability', 7, NULL);

INSERT INTO entries (
	date,
	description,
	credit_account_id,
	debit_account_id,
	amount,
	category,
	subcategory,
	type
)
VALUES
	(
		'2026-03-01T09:00:00Z',
		'Salary',
		(SELECT id FROM accounts WHERE special_role = 'income'),
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		2500000,
		'income',
		'salary',
		'income'
	),
	(
		'2026-03-02T10:00:00Z',
		'Cash withdrawal',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE name = 'Cash Wallet'),
		60000,
		'movement',
		'movement',
		'movement'
	),
	(
		'2026-03-03T13:00:00Z',
		'Groceries',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		185000,
		'food',
		'groceries',
		'expense'
	),
	(
		'2026-03-04T09:00:00Z',
		'Rent',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		650000,
		'housing',
		'rent',
		'expense'
	),
	(
		'2026-03-05T20:00:00Z',
		'Restaurant',
		(SELECT id FROM accounts WHERE name = 'Visa Card'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		42000,
		'food',
		'restaurant',
		'expense'
	),
	(
		'2026-03-06T08:30:00Z',
		'Internet',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		35000,
		'utilities',
		'internet',
		'expense'
	),
	(
		'2026-03-07T10:00:00Z',
		'Transfer to savings',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE name = 'Savings Account'),
		300000,
		'movement',
		'movement',
		'movement'
	),
	(
		'2026-03-08T12:00:00Z',
		'Transit card',
		(SELECT id FROM accounts WHERE name = 'Cash Wallet'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		25000,
		'transport',
		'transit_card',
		'expense'
	),
	(
		'2026-03-10T18:00:00Z',
		'Gift income',
		(SELECT id FROM accounts WHERE special_role = 'income'),
		(SELECT id FROM accounts WHERE name = 'Cash Wallet'),
		80000,
		'income',
		'gift_income',
		'income'
	),
	(
		'2026-03-11T09:30:00Z',
		'Credit card payment',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE name = 'Visa Card'),
		54000,
		'movement',
		'movement',
		'movement'
	),
	(
		'2026-03-12T21:00:00Z',
		'Subscriptions',
		(SELECT id FROM accounts WHERE name = 'Visa Card'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		12000,
		'entertainment',
		'subscriptions',
		'expense'
	),
	(
		'2026-03-13T18:00:00Z',
		'Hotel booking',
		(SELECT id FROM accounts WHERE name = 'Visa Card'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		220000,
		'vacation',
		'lodging',
		'expense'
	),
	(
		'2026-03-14T14:00:00Z',
		'Medication',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		18000,
		'wellness',
		'medication',
		'expense'
	),
	(
		'2026-02-01T09:00:00Z',
		'Salary',
		(SELECT id FROM accounts WHERE special_role = 'income'),
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		2500000,
		'income',
		'salary',
		'income'
	),
	(
		'2026-02-03T13:00:00Z',
		'Groceries',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		170000,
		'food',
		'groceries',
		'expense'
	),
	(
		'2026-02-04T09:00:00Z',
		'Rent',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		650000,
		'housing',
		'rent',
		'expense'
	),
	(
		'2026-02-07T10:00:00Z',
		'Transfer to savings',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE name = 'Savings Account'),
		250000,
		'movement',
		'movement',
		'movement'
	),
	(
		'2026-02-09T18:00:00Z',
		'Gas',
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		60000,
		'transport',
		'gas',
		'expense'
	),
	(
		'2026-02-12T11:00:00Z',
		'Refund',
		(SELECT id FROM accounts WHERE special_role = 'income'),
		(SELECT id FROM accounts WHERE name = 'Checking Account'),
		40000,
		'income',
		'refund',
		'income'
	),
	(
		'2026-02-15T21:00:00Z',
		'Movies',
		(SELECT id FROM accounts WHERE name = 'Visa Card'),
		(SELECT id FROM accounts WHERE special_role = 'expenses'),
		15000,
		'entertainment',
		'movies',
		'expense'
	);

COMMIT;
