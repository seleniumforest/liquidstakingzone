import shell from 'shelljs';
import path from "path";
import * as dotenv from 'dotenv';
dotenv.config();

async function exec(file: string) {
    let query = `clickhouse-client --multiquery < ${file} `;
    if (process.env.CLICKHOUSE_PASS)
        query += `--user ${process.env.CLICKHOUSE_USER} --password ${process.env.CLICKHOUSE_PASS}`;
    
    return shell.exec(query);
}

(async () => {
    exec(path.join(__dirname, "db.sql"));
    exec(path.join(__dirname, "tables.sql"));

    shell.find(path.join(__dirname, '/views'))
        .filter((file) => file.match(/\.sql$/))
        .forEach(v => exec(v));

    exec(path.join(__dirname, "dict.sql"));
})();