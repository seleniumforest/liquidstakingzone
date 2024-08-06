CREATE OR REPLACE FUNCTION get_redemption_rates_and_prices(zone_name TEXT)
RETURNS TABLE (
    date NUMERIC(78,0),
    price FLOAT,
    rate FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH dates AS (
        SELECT DISTINCT
            (EXTRACT(EPOCH FROM date_trunc('day', m."date")) * 1000)::NUMERIC(78,0) AS dt
        FROM
            "MsgLiquidStake" m
        WHERE
            m."zone" = zone_name
        ORDER BY
            dt
    ),
    daily_prices AS (
        SELECT
            (EXTRACT(EPOCH FROM date_trunc('day', ph."date")) * 1000)::NUMERIC(78,0) AS date,
            AVG(ph."price") AS price
        FROM
            "PriceHistory" ph
        JOIN
            "ZonesInfo" zi ON zi."coingeckoId" = ph."coin"
        WHERE
            zi."zone" = zone_name
            AND ph."vsCurrency" != 'usd'
            AND ph."price" > 0
        GROUP BY
            date_trunc('day', ph."date")
        ORDER BY
            date_trunc('day', ph."date") DESC
    ),
    average_redemption_rates AS (
        SELECT
            (EXTRACT(EPOCH FROM date_trunc('day', rr."dateEnd")) * 1000)::BIGINT AS dt,
            rr."zone",
            AVG(rr."redemptionRate") AS rate
        FROM
            "RedemptionRate" rr
        GROUP BY
            date_trunc('day', rr."dateEnd"),
            rr."zone"
    )
    SELECT
        d.dt AS date,
        dp.price AS price,
        arr.rate AS rate
    FROM
        dates d
    JOIN
        daily_prices dp ON d.dt = dp.date
    JOIN
        average_redemption_rates arr ON arr.dt = d.dt
    WHERE
        arr."zone" = zone_name
    ORDER BY
        d.dt;
END;
$$ LANGUAGE plpgsql;
