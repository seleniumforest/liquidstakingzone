CREATE OR REPLACE VIEW redemption_rates_and_prices AS WITH dates as (
        SELECT DISTINCT toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) * 1000 AS dt
        FROM msgs_MsgLiquidStake mmls
        WHERE zone = { zone_name: String }
        ORDER BY dt
    ),
    daily_prices as (
        SELECT toUnixTimestamp(startOfDay) * 1000 as date,
            avg(avgprice) AS price
        FROM (
                SELECT avg(price) as avgprice,
                    toStartOfDay(toDateTime64(date / 1000, 3, 'Etc/UTC')) as startOfDay
                FROM Stride.price_history ph
                    JOIN Stride.zones_info zi on zi.coingeckoId = ph.coin
                WHERE zi.zone = { zone_name: String }
                    AND vsCurrency != 'usd'
                    and price > 0
                GROUP BY startOfDay,
                    date
                ORDER BY date DESC
            )
        GROUP BY startOfDay
        ORDER BY startOfDay
    )
select d.dt as date,
    dp.price as price,
    rr.rate as rate
from dates d
    join daily_prices dp on d.dt = dp.date
    join redemption_rates rr on rr.date = d.dt
WHERE rr.zone = { zone_name: String }
order by d.dt