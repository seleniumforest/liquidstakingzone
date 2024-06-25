ALTER TABLE Stride.zones_info DELETE
WHERE 1 = 1;

INSERT INTO Stride.zones_info(*)
SELECT 'cosmos', 6, 'cosmos'
UNION ALL
SELECT 'stars', 6, 'stargaze'
UNION ALL
SELECT 'osmo', 6, 'osmosis'
UNION ALL
SELECT 'juno', 6, 'juno-network'
UNION ALL
SELECT 'terra', 6, 'terra-luna-2'
UNION ALL
SELECT 'evmos', 18, 'evmos'
UNION ALL
SELECT 'inj', 18, 'injective-protocol'
UNION ALL
SELECT 'scrt', 6, 'secret'
UNION ALL
SELECT 'umee', 6, 'umee'
UNION ALL
SELECT 'tia', 6, 'celestia'
UNION ALL
SELECT 'dym', 6, 'dymension'
UNION ALL
SELECT 'saga', 6, 'saga-2'
UNION ALL
SELECT 'dydx', 6, 'dydx-chain'