WITH latest_liquid_stake AS (
  SELECT
    l."date",
    l."txhash",
    l."amountAmount"::numeric AS "tokenIn",
    l."receivedStTokenAmount"::numeric AS "tokenOut",
    ((l."amountAmount"::numeric / (10 ^ z."decimals")) * p.price)::numeric AS "usd_value",
    l."zone"
  FROM
    public."MsgLiquidStake" l
  JOIN
    public."ZonesInfo" z ON l."zone" = z."zone"
  JOIN (
    SELECT
      date_trunc('day', "date") AS dt,
      AVG("price") AS price,
      "coin"
    FROM
      public."PriceHistory"
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
    public."RedemptionRate"
  GROUP BY
    date_trunc('day', "dateEnd"),
    "zone"
),
latest_redeem_stake AS (
  SELECT
    r."date",
    r."txhash",
    r."amount"::numeric AS "tokenIn",
    ((r."amount"::numeric / (10 ^ z."decimals")) * arr.avg_redemption_rate)::numeric AS "tokenOut",
    ((r."amount"::numeric / (10 ^ z."decimals")) * p.price)::numeric AS "usd_value",
    r."zone"
  FROM
    public."MsgRedeemStake" r
  JOIN
    public."ZonesInfo" z ON r."zone" = z."zone"
  JOIN (
    SELECT
      date_trunc('day', "date") AS dt,
      AVG("price") AS price,
      "coin"
    FROM
      public."PriceHistory"
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
  "date",
  "txhash",
  "tokenIn",
  "tokenOut",
  "usd_value",
  "zone"
FROM
  latest_liquid_stake
UNION ALL
SELECT
  "date",
  "txhash",
  "tokenIn",
  "tokenOut",
  "usd_value",
  "zone"
FROM
  latest_redeem_stake
ORDER BY
  "date" DESC;
