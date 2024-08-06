CREATE OR REPLACE view "latest_events" AS
WITH latest_liquid_stake AS (
  SELECT
    l."date",
    l."txhash",
    l."creator",
    (l."amountAmount"::numeric / (10 ^ z."decimals")) AS "tokenIn",
    (l."receivedStTokenAmount"::numeric / (10 ^ z."decimals")) AS "tokenOut",
    ((l."amountAmount"::numeric / (10 ^ z."decimals")) * p.price) AS "usd_value",
    l."zone",
    'stake' as "action"
  FROM
    "MsgLiquidStake" l
  JOIN
    "ZonesInfo" z ON l."zone" = z."zone"
  JOIN (
    SELECT
      date_trunc('day', "date") AS dt,
      AVG("price") AS price,
      "coin"
    FROM
      "PriceHistory"
    WHERE
      "vsCurrency" = 'usd'
    GROUP BY
      date_trunc('day', "date"),
      "coin"
  ) p ON date_trunc('day', l."date") = p.dt AND z."coingeckoId" = p."coin"
  WHERE
    ((l."amountAmount"::numeric / (10 ^ z."decimals")) * p.price) > 100
  ORDER BY
    l."date" DESC
  LIMIT 10
),
average_redemption_rates AS (
  SELECT
    date_trunc('day', "dateEnd") AS dt,
    "zone",
    AVG("redemptionRate") AS avg_redemption_rate
  FROM
    "RedemptionRate"
  GROUP BY
    date_trunc('day', "dateEnd"),
    "zone"
),
latest_redeem_stake AS (
  SELECT
    r."date",
    r."txhash",
    r."creator",
    (r."amount"::numeric / (10 ^ z."decimals")) AS "tokenIn",
    ((r."amount"::numeric / (10 ^ z."decimals")) * arr.avg_redemption_rate) AS "tokenOut",
    ((r."amount"::numeric / (10 ^ z."decimals")) * p.price) AS "usd_value",
    r."zone",
    'redeem' as "action"
  FROM
    "MsgRedeemStake" r
  JOIN
    "ZonesInfo" z ON r."zone" = z."zone"
  JOIN (
    SELECT
      date_trunc('day', "date") AS dt,
      AVG("price") AS price,
      "coin"
    FROM
      "PriceHistory"
    WHERE
      "vsCurrency" = 'usd'
    GROUP BY
      date_trunc('day', "date"),
      "coin"
  ) p ON date_trunc('day', r."date") = p.dt AND z."coingeckoId" = p."coin"
  JOIN
    average_redemption_rates arr ON r."zone" = arr."zone" AND date_trunc('day', r."date") = arr.dt
  WHERE
    ((r."amount"::numeric / (10 ^ z."decimals")) * p.price) > 100
  ORDER BY
    r."date" DESC
  LIMIT 10
)
SELECT
  *
FROM
  latest_liquid_stake
UNION ALL
SELECT
  *
FROM
  latest_redeem_stake
ORDER BY
  "date" DESC;
