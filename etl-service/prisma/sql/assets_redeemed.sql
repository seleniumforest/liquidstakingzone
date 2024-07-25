CREATE OR REPLACE VIEW assets_redeemed AS
WITH redemption_amounts AS (
  SELECT
    date_trunc('day', r.date) AS date,
    r.zone,
    SUM(r.amount::numeric / (10 ^ z.decimals)) AS total_redemptions
  FROM
    public."MsgRedeemStake" r
  JOIN
    public."ZonesInfo" z ON r.zone = z.zone
  GROUP BY
    date_trunc('day', r.date),
    r.zone,
    z.decimals
),
average_redemption_rates AS (
  SELECT
    date_trunc('day', rr."dateEnd") AS date,
    rr.zone,
    AVG(rr."redemptionRate") AS avg_redemption_rate
  FROM
    public."RedemptionRate" rr
  GROUP BY
    date_trunc('day', rr."dateEnd"),
    rr.zone
)
SELECT
  ra.date,
  ra.zone,
  ra.total_redemptions,
  arr.avg_redemption_rate,
  ra.total_redemptions * arr.avg_redemption_rate AS adjusted_redemptions
FROM
  redemption_amounts ra
JOIN
  average_redemption_rates arr ON ra.zone = arr.zone AND ra.date = arr.date
ORDER BY
  ra.date;

