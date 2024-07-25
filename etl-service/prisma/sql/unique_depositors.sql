CREATE OR REPLACE VIEW "public"."unique_depositors" AS
WITH daily_depositors AS (
    SELECT
        EXTRACT(EPOCH FROM date_trunc('day', s."date")) * 1000 AS dt,
        s."creator",
        ROW_NUMBER() OVER (PARTITION BY s."creator" ORDER BY s."date") AS row_num
    FROM
        public."MsgLiquidStake" s
    WHERE
        s."txcode" = '0'
),
unique_daily_depositors AS (
    SELECT
        dt,
        COUNT(DISTINCT creator) AS daily_deps
    FROM
        daily_depositors
    WHERE
        row_num = 1
    GROUP BY
        dt
),
cumulative_depositors AS (
    SELECT
        dt,
        SUM(daily_deps) OVER (ORDER BY dt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_deps
    FROM
        unique_daily_depositors
)
SELECT
    dt AS date,
    cumulative_deps AS deps
FROM
    cumulative_depositors
ORDER BY
    date;
