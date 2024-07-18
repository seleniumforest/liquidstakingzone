CREATE OR REPLACE VIEW protocol_revenue AS
WITH prices AS (
    SELECT 
        ph."coin",
        (EXTRACT(EPOCH FROM date_trunc('day', ph."date")) * 1000)::BIGINT AS date,
        AVG(ph."price") AS price
    FROM 
        public."PriceHistory" ph
    WHERE 
        ph."vsCurrency" = 'usd'
    GROUP BY 
        date_trunc('day', ph."date"), ph."coin"
    ORDER BY 
        ph."coin", date
),
fees AS (
    SELECT 
        rs."zone",
        (EXTRACT(EPOCH FROM date_trunc('day', bh."date")) * 1000)::BIGINT AS dt,
        SUM(rs."amountAmount"::numeric) AS amount
    FROM 
        public."ZonesRestake" rs
    JOIN 
        public."BlockHeader" bh ON bh."height" = rs."height"
    WHERE 
        rs."type" = 'fee'
    GROUP BY 
        dt, rs."zone"
    ORDER BY 
        rs."zone", dt
),
restake AS (
    SELECT 
        rs."zone",
        (EXTRACT(EPOCH FROM date_trunc('day', bh."date")) * 1000)::BIGINT AS dt,
        SUM(rs."amountAmount"::numeric) AS amount
    FROM 
        public."ZonesRestake" rs
    JOIN 
        public."BlockHeader" bh ON bh."height" = rs."height"
    WHERE 
        rs."type" = 'delegation'
    GROUP BY 
        dt, rs."zone"
    ORDER BY 
        rs."zone", dt
)
SELECT 
    date,
    SUM(fee) AS fee,
    SUM(restake) AS restake
FROM (
    SELECT 
        z."zone",
        (f.amount / (10 ^ z."decimals") * p.price) AS fee,
        f.dt AS date,
        (r.amount / (10 ^ z."decimals") * p.price) AS restake
    FROM 
        prices p
    JOIN 
        fees f ON p.date = f.dt
    JOIN 
        public."ZonesInfo" z ON f."zone" = z."zone" AND p."coin" = z."coingeckoId"
    JOIN 
        restake r ON r.dt = f.dt AND r."zone" = z."zone"
    ORDER BY 
        p."coin", p.date
) sub
GROUP BY 
    date
ORDER BY 
    date;