CREATE OR REPLACE VIEW tvl_by_chains AS WITH deposited as (
        SELECT dt as date,
            SUM(am) OVER(
                ORDER BY dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) as amount
        FROM (
                SELECT toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) * 1000 as dt,
                    SUM(amount.2) as am
                FROM Stride.msgs_MsgLiquidStake
                WHERE zone = { zone_name: String }
                    and txcode = 0
                GROUP BY dt
                ORDER BY dt
            )
    ),
    redemptionRates as (
        SELECT dt * 1000 as date,
            AVG(rate) as rate
        FROM (
                SELECT toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) AS dt,
                    toUInt256(amount.2) / toUInt256(recievedStTokenAmount.2) as rate
                FROM Stride.msgs_MsgLiquidStake
                WHERE zone = { zone_name: String }
                    AND txcode = 0
                    and amount.2 > 1000
                ORDER BY date
            )
        GROUP BY dt
        ORDER BY dt
    ),
    redeemed as (
        SELECT dt as date,
            SUM(amount * rate) OVER(
                ORDER BY dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) as amount
        FROM (
                SELECT toUnixTimestamp(
                        toStartOfDay(toDateTime64(redeem.date, 3, 'Etc/UTC'))
                    ) * 1000 as dt,
                    (
                        select decimals
                        from Stride.zones_info
                        where zone = { zone_name: String }
                    ) as decimals,
                    (
                        SUM(toUInt256(redeem.amount)) / pow(10, decimals)
                    ) as amount
                FROM Stride.msgs_MsgRedeemStake redeem
                WHERE zone = { zone_name: String }
                    and txcode = 0
                GROUP BY dt
                ORDER BY dt
            ) r
            JOIN redemptionRates rr on r.dt = rr.date
    ),
    priceData as (
        SELECT toUnixTimestamp(startOfDay) * 1000 as date,
            avg(price) AS price
        FROM (
                SELECT avg(price) as price,
                    toStartOfDay(toDateTime64(date / 1000, 3, 'Etc/UTC')) as startOfDay
                FROM Stride.price_history
                WHERE coin = (
                        select coingeckoId
                        from Stride.zones_info
                        where zone = { zone_name: String }
                    )
                    AND vsCurrency = 'usd'
                GROUP BY startOfDay,
                    date
                ORDER BY date DESC
            )
        GROUP BY startOfDay
        ORDER BY startOfDay
    )
SELECT pd.date as date,
    (
        select decimals
        from Stride.zones_info
        where zone = { zone_name: String }
    ) as decimals,
    (
        d.amount / pow(10, decimals) - ifNull(r.amount, 0)
    ) * pd.price * max2(rr.rate, 1) as temp_tvl,
    if (
        temp_tvl = 0,
        any(temp_tvl) over (
            ORDER BY date ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
        ) as lag,
        temp_tvl
    ) as tvl
FROM priceData pd
    LEFT JOIN deposited d on pd.date = d.date
    LEFT JOIN redeemed r on pd.date = r.date
    LEFT JOIN redemptionRates rr on r.date = rr.date