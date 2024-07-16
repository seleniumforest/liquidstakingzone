CREATE VIEW assets_on_staking_wallets AS
WITH latest_balances AS (
  SELECT
    abh.zone,
    abh.address,
    MAX(abh.date) AS latest_date
  FROM
    public."AccountBalanceHistory" abh
  GROUP BY
    abh.zone,
    abh.address
),
past_day_balances AS (
  SELECT
    abh.zone,
    abh.address,
    MAX(abh.date) FILTER (WHERE abh.date <= NOW() - INTERVAL '24 HOURS') AS past_day_date
  FROM
    public."AccountBalanceHistory" abh
  GROUP BY
    abh.zone,
    abh.address
)
SELECT
  l.zone,
  l.latest_date,
  FLOOR((SELECT abh."assetsAmount"::numeric / (10 ^ z.decimals) FROM public."AccountBalanceHistory" abh
         JOIN public."ZonesInfo" z ON abh.zone = z.zone
         WHERE abh.zone = l.zone AND abh.address = l.address AND abh.date = l.latest_date)) AS latest_assets,
  p.past_day_date,
  FLOOR((SELECT abh."assetsAmount"::numeric / (10 ^ z.decimals) FROM public."AccountBalanceHistory" abh
         JOIN public."ZonesInfo" z ON abh.zone = z.zone
         WHERE abh.zone = p.zone AND abh.address = p.address AND abh.date = p.past_day_date)) AS past_day_assets
FROM
  latest_balances l
LEFT JOIN
  past_day_balances p ON l.zone = p.zone AND l.address = p.address;