CREATE VIEW active_users AS
SELECT
  date_trunc('day', date) AS date_midnight,
  COUNT(DISTINCT creator) AS active_users
FROM (
  SELECT
    date,
    creator
  FROM
    "MsgLiquidStake" mls
  UNION ALL
  SELECT
    date,
    creator
  FROM
    "MsgRedeemStake" mrs 
) AS combined_transactions
GROUP BY
  date_midnight
ORDER BY
  date_midnight;