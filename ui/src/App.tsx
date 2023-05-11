import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import styles from './App.module.scss';
import { Assets } from './features/assets/Assets';
import { Events } from './features/events/Events';
import { GeneralData } from './features/generalData/GeneralData';
//import { HeaderStake } from './features/headerStake/HeaderStake';
import { Users } from './features/users/Users';
import { AppError } from './reusable/error/error';

function App() {
    return (
        <div className={styles.app}>
            <div className={styles.content}>
                <div className={styles.blocks}>
                    {/* <HeaderStake /> */}
                    <ErrorBoundary fallback={<AppError />}>
                        <GeneralData />
                    </ErrorBoundary>
                    <Assets />
                    <Users />
                    <ErrorBoundary fallback={<AppError />}>
                        <Events />
                    </ErrorBoundary>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default App;


function Footer() {
    return (
        <div className={styles.footer}>
            <div style={{ flexGrow: 4 }} />
            © 2023, ❤️ Proudly built by
            <a href="https://twitter.com/LetsCodeWeb3" target="_blank" rel="noreferrer">
                <img src='/img/letscode-logo.png' alt={`Let's Code`} />
            </a>
            <span>X</span>
            <a href="https://quantnode.tech/" target="_blank" rel="noreferrer">
                <img src='/img/quantnode-logo.png' alt={` `} />
            </a>
            <span style={{ fontFamily: `Futura, Futura-Medium, "Futura Medium", "Century Gothic", CenturyGothic, "Apple Gothic", AppleGothic, "URW Gothic L", "Avant Garde", sans-serif` }}>QUANTNODE ❤️</span>
            <div style={{ flexGrow: 5 }} />
        </div>
    );
}
