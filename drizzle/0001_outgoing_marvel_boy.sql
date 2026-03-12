ALTER TABLE `accounts` ADD `special_role` text;

--> statement-breakpoint
INSERT INTO accounts (name, type, special_role) VALUES ('Income', 'liability', 'income');
--> statement-breakpoint
INSERT INTO accounts (name, type, special_role) VALUES ('Expenses', 'asset', 'expenses');

-- Recalculate entry types based on special accounts
--> statement-breakpoint
UPDATE entries SET type = 'income'
  WHERE credit_account_id = (SELECT id FROM accounts WHERE special_role = 'income');
--> statement-breakpoint
UPDATE entries SET type = 'expense'
  WHERE debit_account_id = (SELECT id FROM accounts WHERE special_role = 'expenses');
--> statement-breakpoint
UPDATE entries SET type = 'movement'
  WHERE credit_account_id != (SELECT id FROM accounts WHERE special_role = 'income')
    AND debit_account_id != (SELECT id FROM accounts WHERE special_role = 'expenses');