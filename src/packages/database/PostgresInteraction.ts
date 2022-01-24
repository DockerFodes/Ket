import { Client } from "pg";
import table from "./_DatabaseTables";

let
    PgConfig = {
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        ssl: process.env.SSL_MODE == 'false' ? false : { rejectUnauthorized: false }
    },
    postgres = global.session.postgres = new Client(PgConfig);

global.session.db = {
    ready: false,
    disconnect: () => {
        postgres.end()
        global.session.db.ready = false;
    }
}

module.exports = async (ket) => {

    if (global.session.db.ready) return;
    await postgres.connect()
        .then(() => {
            global.session.db = {
                ready: true,
                disconnect: () => {
                    postgres.end()
                    global.session.db.ready = false;
                },
                users: new table('users', 'id', postgres),
                servers: new table('servers', 'id', postgres),
                globalchat: new table('globalchat', 'id', postgres),
                commands: new table('commands', 'name', postgres),
                blacklist: new table('blacklist', 'id', postgres)
            };
            console.log('DATABASE', '√ Banco de dados operante', 32);
        })
        .catch((error) => console.log('DATABASE', `x Não foi possível realizar conexão ao banco de dados: ${error}`, 41))

    /* DATABASE TESTS */
    await postgres.query(`SELECT * FROM users`)
        .catch(async () => {
            console.log('DATABASE', 'Criando tabela users', 2);
            await postgres.query(`CREATE TABLE public.users (
            id VARCHAR(20) NOT NULL PRIMARY KEY,
            prefix VARCHAR(3) NOT NULL DEFAULT '${ket.config.DEFAULT_PREFIX}',
            lang VARCHAR(2) DEFAULT 'pt',
            commands NUMERIC CHECK(commands > -1) DEFAULT 1),
            banned TEXT NULL);`)
        })

    await postgres.query(`SELECT * FROM servers`)
        .catch(async () => {
            console.log('DATABASE', 'Criando tabela servers', 2);
            await postgres.query(`CREATE TABLE public.servers (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    lang VARCHAR(2) NULL,
                    globalchat VARCHAR(20) NULL,
                    partner BOOLEAN NULL,
                    banned TEXT NULL);`)
        })

    await postgres.query(`SELECT * FROM commands`)
        .catch(async () => {
            console.log('DATABASE', 'Criando tabela commands', 2);
            await postgres.query(`CREATE TABLE public.commands (
                        name TEXT NOT NULL PRIMARY KEY,
                        maintenance BOOLEAN NULL,
                        reason TEXT NULL
                      );`)
        })

    await postgres.query(`SELECT * FROM globalchat`)
        .catch(async () => {
            console.log('DATABASE', 'Criando tabela globalchat', 2);
            await postgres.query(`CREATE TABLE public.globalchat (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    guild VARCHAR(20) NOT NULL,
                    author VARCHAR(20) NOT NULL,
                    editcount NUMERIC DEFAULT 0,
                    messages VARCHAR(40)[] NULL
                  );`)
        })

    return await postgres.query(`SELECT * FROM blacklist`)
        .catch(async () => {
            console.log('DATABASE', 'Criando tabela blacklist', 2);
            await postgres.query(`CREATE TABLE public.blacklist (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    timeout NUMERIC NULL,
                    warns NUMERIC DEFAULT 1
                  );`)
        })
}