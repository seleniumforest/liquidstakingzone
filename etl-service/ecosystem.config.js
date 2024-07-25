module.exports = {
    apps: [
        {
            name: 'fetch-blocks-job',
            script: 'npm',
            args: 'run blocks',
            autorestart: true,
            watch: false,
            error_file: './logs/fetch-blocks-job-err.log',
            out_file: './logs/fetch-blocks-job-out.log'
        },
        {
            name: 'external-accounts-checker-job',
            script: 'npm',
            args: 'run balances',
            autorestart: true,
            watch: false,
            error_file: './logs/external-accounts-checker-job-err.log',
            out_file: './logs/external-accounts-checker-job-out.log'
        },
        {
            name: 'price-update-job',
            script: 'npm',
            args: 'run prices',
            autorestart: true,
            watch: false,
            error_file: './logs/price-update-job-err.log',
            out_file: './logs/price-update-job-out.log'
        },
        {
            name: 'telegram-notifier',
            script: 'npm',
            args: 'run notifier',
            autorestart: true,
            watch: false,
            error_file: './logs/telegram-notifier-err.log',
            out_file: './logs/telegram-notifier-out.log'
        },
        {
            name: 'backend',
            script: 'npm',
            args: 'run backend',
            autorestart: true,
            watch: false,
            error_file: './logs/backend-err.log',
            out_file: './logs/backend-out.log'
        }
    ]
};
