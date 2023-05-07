import { useQuery } from 'react-query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Zone, ZoneInfo } from './constants';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useZonesInfo = () => useQuery<ZoneInfo[]>("zonesInfo", async () =>
    fetch(`${process.env.REACT_APP_API_BASEURL}/zonesInfo`).then(res => res.json() as unknown as ZoneInfo[])
);