CREATE OR REPLACE VIEW Stride.assets_on_staking_wallets as WITH latestData as (
    SELECT *
    from Stride.account_balances_history a2
        JOIN (
            SELECT zone,
                max(date) as dt
            FROM Stride.account_balances_history a1
            GROUP BY zone
        ) as sub on sub.dt = a2.date
),
pastDayData as (
    WITH data as (
        SELECT abs(
                (toUnixTimestamp(subtractDays(now64(), 1)) * 1000) - date
            ) as diff,
            zone,
            date,
            assets
        FROM Stride.account_balances_history
        ORDER BY zone
    )
    SELECT zone,
        date,
        assets
    FROM data d1
        JOIN (
            SELECT zone,
                min(diff) as diff
            FROM data
            GROUP BY zone
        ) AS d2 ON d2.diff = d1.diff
)
SELECT ld.zone as zone,
    ld.date as latestDate,
    round(ld.assets [1].2 / pow(10, zi.decimals)) as latestAssets,
    pd.date as pastDayDate,
    round(pd.assets [1].2 / pow(10, zi.decimals)) as pastDayAssets
FROM latestData ld
    JOIN Stride.zones_info zi on ld.zone = zi.zone
    JOIN pastDayData pd ON pd.zone = ld.zone