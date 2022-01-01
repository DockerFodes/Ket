export { };
const
    c = require('chalk'),
    { Client } = require('pg'),
    table = require('./_DatabaseTables');

let
    PgConfig: typeof Client = {
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        ssl: process.env.SSL_MODE == 'false' ? false : { rejectUnauthorized: false }
    },
    postgres = global.session.postgres = new Client(PgConfig),
    db: any = global.session.db = {
        ready: false,
        disconnect: () => postgres.end
    };

module.exports = async (ket) => {

    if (db.ready) return;
    global.session.log('shard', 'DATABASE', 'Conectando ao banco de dados...')
    try {
        await postgres.connect();

        db = global.session.db = {
            ready: true,
            disconnect: () => postgres.end,
            users: { ...(new table(postgres).set('users', 'id')) },
            servers: { ...(new table(postgres).set('servers', 'id')) },
            globalchat: { ...(new table(postgres).set('globalchat', 'id')) },
            commands: { ...(new table(postgres).set('commands', 'name')) }
        };
        global.session.log('log', 'DATABASE', '√ Banco de dados operante');
    } catch (error) {
        global.session.log('error', 'DATABASE', `x Não foi possível realizar conexão ao banco de dados, tentando novamente em 15 segundos...`, error);
        return setTimeout(() => module.exports(), 15000);
    };
    /* DATABASE TESTS */
    try { await postgres.query(`SELECT * FROM users`) }
    catch (e) {
        global.session.log('log', 'DATABASE', c.yellow(`Criando tabela de dados para usuários`))
        await postgres.query(`CREATE TABLE public.users (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    prefix VARCHAR(3) NOT NULL DEFAULT '${ket.config.DEFAULT_PREFIX}',
                    lang VARCHAR(2) DEFAULT 'pt',
                    commands NUMERIC CHECK(commands > -1) DEFAULT 1,
                    banned BOOLEAN NULL,
                    banReason TEXT NULL
                );`);
    }; try { await postgres.query(`SELECT * FROM servers`) }
    catch (e) {
        global.session.log('log', 'DATABASE', c.blue(`Criando tabela de dados para servidores`))
        await postgres.query(`CREATE TABLE public.servers (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    globalchat VARCHAR(20) NULL,
                    partner BOOLEAN NULL,
                    banned BOOLEAN NULL,
                    banreason TEXT NULL
                );`);
    }; try { await postgres.query(`SELECT * FROM commands`) }
    catch (e) {
        global.session.log('log', 'DATABASE', c.green(`Criando tabela de dados para comandos`))
        await postgres.query(`CREATE TABLE public.commands (
                    name TEXT NOT NULL PRIMARY KEY,
                    maintenance BOOLEAN NULL,
                    reason TEXT DEFAULT NULL
                  );`);
    }; try { await postgres.query(`SELECT * FROM globalchat`); }
    catch (e) {
        global.session.cyan('log', 'DATABASE', c.yellow(`Criando tabela de dados para chat global`))
        await postgres.query(`CREATE TABLE public.globalchat (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    author VARCHAR(20) NOT NULL,
                    editcount NUMERIC DEFAULT 0,
                    messages VARCHAR(40)[] NULL
                  );`);
    }
    return;
}