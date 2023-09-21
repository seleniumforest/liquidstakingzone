CREATE OR REPLACE VIEW assets_deposited AS
SELECT toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) * 1000 as date,
    floor(
        SUM(am) / pow(
            10,
            (
                select decimals
                from Stride.zones_info
                where zone = { zone_name: String }
            )
        ),
        0
    ) as amount
FROM (
        SELECT date,
            amount.2 as am
        FROM Stride.msgs_MsgLiquidStake
        WHERE zone = { zone_name: String }
            and txcode = 0
    )
GROUP BY date
ORDER BY date