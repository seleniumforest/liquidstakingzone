
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { supportedZones, TimePeriod, TimeSpan, Zone } from '../../app/constants';
import { RootState, AppThunk } from '../../app/store';
import { fetchAssets } from './AssetsExcludingInterest';


// type AllControlsState = {
//     zone: Zone,
//     timePeriod: TimePeriod,
//     timeSpan: TimeSpan,
//     showAsCumulative: boolean
// };
// export interface AssetsState {
//     assetsDeposited?: AllControlsState,
//     redeemedAssets?: AllControlsState,
//     feesAndRevenue?: Omit<AllControlsState, "zone">,
//     tvlByChains?: {
//         selectedZones: Zone[],
//         timePeriod: TimePeriod,
//         showAsCumulative: boolean
//     },
//     redemptionRate?: Omit<AllControlsState, "showAsCumulative">
// }

// const allControlsDefaultState: AllControlsState = {
//     zone: "atom",
//     timePeriod: 'MAX',
//     timeSpan: 'D',
//     showAsCumulative: false
// };

// const initialState: AssetsState = {
//     assetsDeposited: { ...allControlsDefaultState },
//     redeemedAssets:  { ...allControlsDefaultState },
//     feesAndRevenue: { ...allControlsDefaultState },
//     tvlByChains: {
//         selectedZones: [ ...supportedZones],
//         timePeriod: "MAX",
//         showAsCumulative: false
//     },
//     redemptionRate: { ...allControlsDefaultState }
// };

// export const fetchData = createAsyncThunk(
//     'counter/fetchCount',
//     async (zone: Zone) => {
//         const response = await fetchAssets();
//         return response;
//     }
// );

// export const counterSlice = createSlice({
//     name: 'counter',
//     initialState,
//     // The `reducers` field lets us define reducers and generate associated actions
//     reducers: {
//         // increment: (state) => {
//         //     state.value += 1;
//         // }
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchData.fulfilled, (state, action) => {
//                 state.status = 'idle';
//                 state.value += action.payload;
//             })
//     },
// });

// export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// // The function below is called a selector and allows us to select a value from
// // the state. Selectors can also be defined inline where they're used instead of
// // in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// export const selectCount = (state: RootState) => state.counter.value;

// // We can also write thunks by hand, which may contain both sync and async logic.
// // Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
//     (amount: number): AppThunk =>
//         (dispatch, getState) => {
//             const currentValue = selectCount(getState());
//             if (currentValue % 2 === 1) {
//                 dispatch(incrementByAmount(amount));
//             }
//         };

// export default counterSlice.reducer;
