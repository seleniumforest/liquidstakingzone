CREATE OR REPLACE view "redemption_rates" AS
SELECT
    l."zone",
    EXTRACT(EPOCH FROM date_trunc('day', l."date")) * 1000 AS "date",
    AVG((l."amountAmount"::numeric / l."receivedStTokenAmount"::numeric)) AS "rate"
FROM
    "MsgLiquidStake" l
WHERE
    l."txcode" = 0
    AND (l."amountAmount"::numeric) > 1000
GROUP BY
    l."zone",
    date_trunc('day', l."date");