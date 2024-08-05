declare global {
    namespace NodeJS {
        interface ProcessEnv {
            STATUS_BOT_TG_TOKEN: string;
            DATABASE_INDEXED_URL: string;
            DATABASE_INDEXED_URL_BACKEND: string;
            DATABASE_RAW_URL: string;
            CUSTOM_RPCS: string;
            STATUS_BOT_TG_CHANNEL: string,
        }
    }
}

export { }