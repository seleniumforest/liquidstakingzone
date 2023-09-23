CREATE OR REPLACE VIEW Stride.active_users as WITH stakeUsers AS (
    SELECT toStartOfDay(toDateTime64(date, 3, 'Etc/UTC')) as dt,
        COUNT(DISTINCT creator) as users
    FROM Stride.msgs_MsgLiquidStake
    GROUP BY dt
    ORDER BY dt
),
unstakeUsers AS (
    SELECT toStartOfDay(toDateTime64(date, 3, 'Etc/UTC')) as dt,
        COUNT(DISTINCT creator) as users
    FROM Stride.msgs_MsgRedeemStake
    GROUP BY dt
    ORDER BY dt
)
SELECT toUnixTimestamp(su.dt) * 1000 AS date,
    su.users + uu.users as users
FROM stakeUsers su
    LEFT JOIN unstakeUsers uu on su.dt = uu.dt