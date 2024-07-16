CREATE OR REPLACE FUNCTION get_depositors_volume(zone_name TEXT)
RETURNS TABLE (
  range TEXT,
  count INTEGER
) AS $$
BEGIN
  RETURN QUERY
   WITH ranges AS (
    SELECT '[0, 10)' AS range, 0 AS min_value, 10 AS max_value
    UNION ALL
    SELECT '[10, 100)' AS range, 10 AS min_value, 100 AS max_value
    UNION ALL
    SELECT '[100, 1000)' AS range, 100 AS min_value, 1000 AS max_value
    UNION ALL
    SELECT '[1000, 10000)' AS range, 1000 AS min_value, 10000 AS max_value
    UNION ALL
    SELECT '[10000, 100000)' AS range, 10000 AS min_value, 100000 AS max_value
    UNION ALL
    SELECT '[100000, 1000000)' AS range, 100000 AS min_value, 1000000 AS max_value
    UNION ALL
    SELECT '[1000000, 10000000)' AS range, 1000000 AS min_value, 10000000 AS max_value
  ),
  prices AS (
    SELECT 
      date_trunc('day', date) AS dt,
      AVG(price) AS price
    FROM 
      public."PriceHistory" ph
    WHERE 
      ph."vsCurrency" = 'usd' AND
      coin = (SELECT zi."coingeckoId" FROM public."ZonesInfo" zi WHERE zone = zone_name)
    GROUP BY 
      date_trunc('day', date)
  ),
  liquid_stake_with_prices AS (
    SELECT 
      date_trunc('day', m.date) AS dt,
      (m."amountAmount"::numeric / (10 ^ z.decimals)) * p.price AS am,
      m.zone
    FROM 
      public."MsgLiquidStake" m
    JOIN 
      public."ZonesInfo" z ON m.zone = z.zone
    JOIN 
      prices p ON date_trunc('day', m.date) = p.dt
    WHERE 
      m.zone = zone_name AND
      m.txcode = 0
  )
  SELECT 
    r.range,
    COUNT(lsp.am) AS count
  FROM 
    liquid_stake_with_prices lsp
  JOIN 
    ranges r ON lsp.am > r.min_value AND lsp.am < r.max_value
  GROUP BY 
    r.range
  order by r.range;
END;
$$ LANGUAGE plpgsql;