CREATE OR REPLACE VIEW unique_depositors AS
SELECT dt * 1000 as date,
    MAX(deps) as deps
FROM (
        SELECT toUnixTimestamp(toStartOfDay(toDateTime64(date, 3, 'Etc/UTC'))) AS dt,
            COUNT(DISTINCT creator) OVER(
                ORDER BY date
            ) AS deps
        FROM Stride.msgs_MsgLiquidStake s
        WHERE txcode = '0'
        GROUP BY date,
            creator
    )
GROUP BY dt
ORDER BY dt