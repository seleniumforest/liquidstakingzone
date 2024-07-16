CREATE VIEW assets_deposited AS
SELECT
  date_trunc('day', l.date) AS date,
  l.zone,
  FLOOR(SUM(l."amountAmount"::numeric / (10 ^ z.decimals))) AS total_deposited
FROM
  public."MsgLiquidStake" l
JOIN
  public."ZonesInfo" z ON l.zone = z.zone
GROUP BY
  date_trunc('day', l.date),
  l.zone,
  z.decimals
ORDER BY
  date;