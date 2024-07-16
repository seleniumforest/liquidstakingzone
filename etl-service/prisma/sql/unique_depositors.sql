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
unique_depositors AS (
    SELECT
        dt,
        COUNT(DISTINCT creator) AS deps
    FROM
        daily_depositors
    WHERE
        row_num = 1
    GROUP BY
        dt
)
SELECT
    dt AS date,
    MAX(deps) AS deps
FROM
    unique_depositors
GROUP BY
    dt
ORDER BY
    dt;
