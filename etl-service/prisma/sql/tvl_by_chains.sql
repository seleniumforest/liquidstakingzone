CREATE OR REPLACE VIEW tvl_by_chains AS
WITH daily_deposits AS (
    SELECT
        date_trunc('day', m."date") AS date,
        m."zone",
        SUM(m."amountAmount"::numeric) / (10 ^ z."decimals") AS daily_deposited
    FROM
        public."MsgLiquidStake" m
    JOIN
        public."ZonesInfo" z ON m."zone" = z."zone"
    WHERE
        m."txcode" = 0
    GROUP BY
        date_trunc('day', m."date"),
        m."zone",
        z."decimals"
    ORDER BY
        m."zone",
        date_trunc('day', m."date")
),
cumulative_deposits AS (
    SELECT
        date,
        zone,
        SUM(daily_deposited) OVER (PARTITION BY zone ORDER BY date) AS cumulative_deposited
    FROM
        daily_deposits
),
daily_redeems AS (
    SELECT
        date_trunc('day', r."date") AS date,
        r."zone",
        SUM((r."amount"::numeric) / (10 ^ z."decimals") * (
            SELECT AVG(rr."redemptionRate")
            FROM public."RedemptionRate" rr
            WHERE rr."zone" = r."zone"
              AND date_trunc('day', rr."dateEnd") = date_trunc('day', r."date")
        )) AS daily_redeemed
    FROM
        public."MsgRedeemStake" r
    JOIN
        public."ZonesInfo" z ON r."zone" = z."zone"
    WHERE
        r."txcode" = 0
    GROUP BY
        date_trunc('day', r."date"),
        r."zone",
        z."decimals"
    ORDER BY
        r."zone",
        date_trunc('day', r."date")
),
cumulative_redeems AS (
    SELECT
        date,
        zone,
        SUM(daily_redeemed) OVER (PARTITION BY zone ORDER BY date) AS cumulative_redeemed
    FROM
        daily_redeems
),
daily_prices AS (
    SELECT
        date_trunc('day', ph."date") AS date,
        zi."zone",
        AVG(ph."price") AS price
    FROM
        public."PriceHistory" ph
    JOIN
        public."ZonesInfo" zi ON ph."coin" = zi."coingeckoId"
    WHERE
        ph."vsCurrency" = 'usd'
    GROUP BY
        date_trunc('day', ph."date"),
        zi."zone"
    ORDER BY
        date_trunc('day', ph."date"),
        zi."zone"
)
SELECT
    p.date,
    p.zone,
    (cumulative_deposited - cumulative_redeemed) * p.price AS tvl
FROM
    daily_prices p
JOIN
    cumulative_deposits d ON p.date = d.date AND p.zone = d.zone
JOIN
    cumulative_redeems r ON p.date = r.date AND p.zone = r.zone
ORDER by
 p.zone,
    p.date;