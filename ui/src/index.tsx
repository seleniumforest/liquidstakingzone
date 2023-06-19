import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { backendUrl } from './app/constants';
import moment from 'moment';

const container = document.getElementById('root')!;
const root = createRoot(container);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: false,
            staleTime: Infinity,
        },
    }
});

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path='/status' element={<StatusPage />} />
                    <Route path='*' element={<App />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);


function StatusPage() {
    const { isLoading, error, data } = useQuery(['status'], () =>
        fetch(`${backendUrl}/status`).then(res => res.json())
    );

    if (isLoading)
        return (<>"Loading..."</>);
    if (error)
        return (<>"Error"</>);

    let {
        syncData,
        priceData,
        balanceData
    } = data;

    return (
        <div style={{ color: 'white', padding: "10px" }}>
            <h3>Sync data:</h3>
            <p>Height : {syncData.height}</p>
            <p>Date : {formatDate(syncData.date)}</p>
            <p>Hash : {syncData.hash}</p>
            <h3>Price data:</h3>
            {priceData.map((p: any) => (<>
                <p>Coin: {p.coin} Date: {formatDate(p.date)} Price: {p.price}</p>
            </>))}
            <h3>Balance data:</h3>
            {balanceData.map((p: any) => (<>
                <p>Zone: {p.zone} Date: {formatDate(p.date)} Balance: {p.balance[0]}</p>
            </>))}
        </div>
    )
}

function formatDate(date: any) {
    return moment(date, "x").format("DD/MM/YYYY HH:mm:SS")
}