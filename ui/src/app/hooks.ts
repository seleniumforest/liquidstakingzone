import { useQuery } from 'react-query';
import { ZoneInfo } from './constants';

export const useZonesInfo = () => useQuery<ZoneInfo[]>("zonesInfo", async () =>
    fetch(`${process.env.REACT_APP_API_BASEURL}/zonesInfo`).then(res => res.json() as unknown as ZoneInfo[])
);