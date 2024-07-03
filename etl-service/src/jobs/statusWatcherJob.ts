import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Telegraf } from 'telegraf';
import { } from "../environment";
import { prisma } from '../db';
import { TimeSpansMs } from '../constants';

//-----------BOT SECTION-----------
const bot = new Telegraf(process.env.STATUS_BOT_TG_TOKEN);
setInterval(checkAndNotify, TimeSpansMs.hour);

bot.command('status', async (ctx) => {
    try {
        let { latestBalances, latestDate, latestHeight, latestPrices } = await getSyncStatus();

        let statusMessage =
            `Latest Prices: ${latestPrices.map(({ coin, latestDate }) => `${coin}: ${latestDate}`).join('\n')} \n\n` +
            `Latest Balances:${latestBalances.map(({ zone, latestDate }) => `${zone}: ${latestDate}`).join('\n')} \n\n` +
            `Latest Block Height: ${latestHeight} at ${latestDate}`;

        await ctx.reply(statusMessage);
    } catch (error) {
        console.error('Error getting status:', error);
        await ctx.reply('Error getting status');
    }
});

bot.launch();

//-----------SERVER SECTION-----------

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/notify', async (req: Request, res: Response) => {
    const message: string = req.body.message;

    if (!message) {
        return res.status(400).send('Message is required');
    }

    try {
        await bot.telegram.sendMessage(process.env.STATUS_BOT_TG_CHANNEL, message);
        res.status(200).send('Message sent');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
    }
});

app.get('/status', async (_: Request, res: Response) => {
    try {
        let status = await getSyncStatus();
        res.status(200).send(JSON.stringify(status));
    } catch (error) {
        console.error('Error getting status:', error);
        res.status(500).send('Error getting status');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

//-----------HELPER FUNCTIONS-----------

async function checkAndNotify() {
    try {
        let status = await getSyncStatus();

        const now = new Date();

        const oldestPriceDate = Math.min(...status.latestPrices.map(price => price.latestDate.getTime()));
        const oldestBalanceDate = Math.min(...status.latestBalances.map(balance => balance.latestDate.getTime()));
        let notificationMessage = '';

        if (!status.latestDate) {
            notificationMessage += 'status.latestDate is null\n';
        }
        const latestBlockTime = status.latestDate?.getTime();

        if (now.getTime() - oldestPriceDate > TimeSpansMs.day) {
            notificationMessage += 'One or more token prices have not been updated for over 24 hours.\n';
        }

        if (now.getTime() - oldestBalanceDate > TimeSpansMs.day) {
            notificationMessage += 'One or more account balances have not been updated for over 24 hours.\n';
        }

        if (latestBlockTime && now.getTime() - latestBlockTime > TimeSpansMs.hour) {
            notificationMessage += 'Latest block is older than 1 hour.\n';
        }

        if (notificationMessage) {
            await bot.telegram.sendMessage(process.env.STATUS_BOT_TG_CHANNEL, notificationMessage);
        }
    } catch (error) {
        console.error('Error checking and notifying status:', error);
    }
}

async function getSyncStatus() {
    let latestPrices = await prisma.$queryRaw<{ coin: string, latestDate: Date }[]>`
        SELECT coin, MAX(date) as "latestDate"
        FROM public."PriceHistory" ph
        WHERE ph."vsCurrency" = 'usd'
        GROUP BY coin
    `;

    let latestBalances = await prisma.$queryRaw<{ zone: string, latestDate: Date }[]>`
        SELECT zone, MAX(date) as "latestDate"
        FROM public."AccountBalanceHistory"
        GROUP BY zone;
    `;

    let { _max: { height: latestHeight } } = await prisma.transaction.aggregate({
        _max: { height: true },
    });

    let { _max: { date: latestDate } } = await prisma.transaction.aggregate({
        _max: { date: true },
    });

    return {
        latestPrices,
        latestBalances,
        latestHeight,
        latestDate
    }
}
