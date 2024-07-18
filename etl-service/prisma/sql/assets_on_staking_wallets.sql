CREATE OR REPLACE VIEW "assets_on_staking_wallets" AS
WITH latest_assets AS (
    SELECT 
        abh."zone", 
        "assetsDenom", 
        "assetsAmount"::numeric / (10 ^ zi.decimals) AS "assets_amount_now",
        "date" AS "date_now",
        ROW_NUMBER() OVER (PARTITION BY abh."zone" ORDER BY "date" DESC) AS "row_num_now"
    FROM public."AccountBalanceHistory" abh
    JOIN public."ZonesInfo" zi ON zi.zone = abh."zone"
),
closest_to_24h AS (
    SELECT 
        abh."zone", 
        "assetsDenom", 
        "assetsAmount"::numeric / (10 ^ zi.decimals) AS "assets_amount_24h",
        "date" AS "date_24h",
        ROW_NUMBER() OVER (
            PARTITION BY abh."zone" 
            ORDER BY ABS(EXTRACT(EPOCH FROM ("date" - (NOW() - INTERVAL '24 hours'))))
        ) AS "row_num_24h"
    FROM public."AccountBalanceHistory" abh
    JOIN public."ZonesInfo" zi ON zi.zone = abh."zone"
)
SELECT 
    la."zone",
    la."assets_amount_now" AS latest_assets,
    la."date_now" AS latest_date,
    c24."assets_amount_24h" AS past_day_assets,
    c24."date_24h" AS past_day_date
FROM latest_assets la
JOIN closest_to_24h c24 ON la."zone" = c24."zone" AND la."assetsDenom" = c24."assetsDenom"
WHERE la."row_num_now" = 1 AND c24."row_num_24h" = 1;