UPDATE entries
SET
	category = 'vacation',
	subcategory = 'uncategorized'
WHERE category = 'entertainment' AND subcategory = 'vacation';
--> statement-breakpoint
UPDATE entries
SET subcategory = 'uncategorized'
WHERE category = 'vacation'
	AND (
		subcategory IS NULL
		OR subcategory NOT IN (
			'uncategorized',
			'travel_tickets',
			'lodging',
			'transport',
			'food',
			'activities',
			'shopping'
		)
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'food'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN (
		'groceries',
		'restaurant',
		'snacks',
		'bars_going_out',
		'alcohol',
		'drinks',
		'delivery'
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'transport'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN (
		'transit_card',
		'gas',
		'parking',
		'bicycle',
		'taxi',
		'tolls',
		'car_maintenance',
		'car_payment',
		'car_insurance',
		'car_registration'
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'housing'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN (
		'rent',
		'common_expenses',
		'home_maintenance',
		'decoration',
		'furniture',
		'kitchen_items',
		'bathroom_items',
		'bedroom_items'
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'utilities'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN (
		'electricity',
		'water',
		'gas',
		'internet',
		'cellphone',
		'adjustment',
		'taxes'
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'wellness'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN (
		'dentist',
		'doctor',
		'therapy',
		'medication',
		'beauty_products',
		'hygiene',
		'exercise',
		'supplements'
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'clothing'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN (
		't_shirts',
		'pants',
		'jackets',
		'shoes',
		'underwear',
		'other_clothing'
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'entertainment'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN (
		'books',
		'movies',
		'subscriptions',
		'cinema_theater',
		'events',
		'video_games',
		'games',
		'gifts',
		'dates',
		'paragliding',
		'photography'
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'exercise'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN (
		'gym',
		'climbing',
		'running',
		'classes',
		'equipment'
	);
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'income'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN ('salary', 'gift_income', 'refund');
--> statement-breakpoint
UPDATE entries
SET subcategory = NULL
WHERE category = 'movement'
	AND subcategory IS NOT NULL
	AND subcategory NOT IN ('movement');
