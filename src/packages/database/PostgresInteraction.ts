export { };
const
    c = require('chalk'),
    { Client } = require('pg');
module.exports = async (ket) => {

    let PgConfig: typeof Client = {
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
    }
    if (process.env.SSL_MODE !== 'false') PgConfig.ssl = {}

    const postgres = global.session.postgres = new Client(PgConfig),
        db = global.session.db = {
            ready: false,
            disconnect: () => postgres.end(),
            users: {
                create: async (data: any, returnValue: boolean = false) => {
                    let values = [];
                    for (let i in Object.entries(data)) {
                        let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
                        typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
                    };
                    await postgres.query(`INSERT INTO users (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`);
                    if (returnValue) return await db.users.find(data.id);
                    return;
                },
                update: async (index: string, data: object, returnValue = false) => {
                    let str = [];
                    for (let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`);
                    await postgres.query(`UPDATE users SET
                        ${str.join(`,\n`)}
                        WHERE id = '${index}';
                    `);
                    if (returnValue) return await db.users.find(index);
                    return;
                },
                find: async (id: string, createIfNull = false) => {
                    let search = await postgres.query(`SELECT * FROM users WHERE id = '${id}';`);
                    if (!search.rows[0] && id !== null && createIfNull) {
                        await db.users.create({ id: id });
                        return await db.users.find(id);
                    } else return search.rows[0];
                },
                getAll: async () => {
                    let search = await postgres.query(`SELECT * FROM users;`);
                    return search.rows;
                }
            },
            servers: {
                create: async (data: any, returnValue = false) => {
                    let values = [];
                    for (let i in Object.entries(data)) {
                        let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
                        typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
                    };
                    await postgres.query(`INSERT INTO servers (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`);
                    if (returnValue) return await db.servers.find(data.id);
                    return;
                },
                update: async (index: string, data: object, returnValue: boolean = false) => {
                    let str = [];
                    for (let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`);
                    await postgres.query(`UPDATE servers SET
                        ${str.join(`,\n`)}
                        WHERE id = '${index}';
                    `);
                    if (returnValue) return await db.servers.find(index);
                    return;
                },
                find: async (id: string, createIfNull = false) => {
                    let search = await postgres.query(`SELECT * FROM servers WHERE id = '${id}';`);
                    if (!search.rows[0] && id !== null && createIfNull) {
                        await db.servers.create({ id: id });
                        return await db.servers.find(id);
                    } else return search.rows[0];
                },
                getAll: async () => {
                    let search = await postgres.query(`SELECT * FROM servers;`);
                    return search.rows;
                }
            },
            globalchat: {
                create: async (data: any, returnValue: boolean = false) => {
                    let values = [];
                    for (let i in Object.entries(data)) {
                        let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
                        typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
                    };
                    await postgres.query(`INSERT INTO globalchat (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`);
                    if (returnValue) return await db.globalchat.find(data.id);
                    return;
                },
                update: async (index: string, data: object, returnValue = false) => {
                    let str = [];
                    for (let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`);
                    await postgres.query(`UPDATE globalchat SET
                        ${str.join(`,\n`)}
                        WHERE id = '${index}';
                    `);
                    if (returnValue) return await db.globalchat.find(index);
                    return;
                },
                find: async (id: string, key = 'id', createIfNull = false) => {
                    let search = await postgres.query(`SELECT * FROM globalchat WHERE ${key} = '${id}';`);
                    if (!search.rows[0] && id !== null && createIfNull) {
                        await db.globalchat.create({ id: id });
                        return await db.globalchat.find(id);
                    } else return search.rows[0];
                },
                getAll: async () => {
                    let search = await postgres.query(`SELECT * FROM globalchat;`);
                    return search.rows;
                }
            },
            commands: {
                create: async (data: any, returnValue: boolean = null) => {
                    let values = [];
                    for (let i in Object.entries(data)) {
                        let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
                        typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
                    };
                    await postgres.query(`INSERT INTO commands (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`);
                    if (returnValue) return await db.commands.find(data.name);
                    return;
                },
                update: async (index: string, data: any, returnValue: boolean = null) => {
                    let str = [];
                    for (let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`);
                    await postgres.query(`UPDATE commands SET
                        ${str.join(`,\n`)}
                        WHERE name = '${index}';
                    `);
                    if (returnValue) return await db.commands.find(index);
                    return;
                },
                find: async (name: string, createIfNull = false) => {
                    let search = await postgres.query(`SELECT * FROM commands WHERE name = '${name}';`);
                    if (!search.rows[0] && name !== null && createIfNull) {
                        await db.commands.create({ name: name });
                        return await db.commands.find(name);
                    } else return search.rows[0];
                },
                getAll: async () => {
                    let search = await postgres.query(`SELECT * FROM commands;`);
                    return search.rows;
                }
            }
        };
    if (db.ready) return;
    console.log(`Conectando ao banco de dados...`);
    try {
        await postgres.connect();
        db.ready = true;
        global.session.log('log', 'DATABASE', '√ Banco de dados operante');
    } catch (error) {
        global.session.log('error', 'DATABASE', `x Não foi possível realizar conexão ao banco de dados, tentando novamente em 15 segundos...`, error);
        return setTimeout(() => module.exports(), 15000);
    };

    /* DATABASE TESTS */
    try {
        await postgres.query(`SELECT * FROM users`);
    } catch (e) {
        console.log(c.yellow(`Criando tabela de dados para usuários`));
        await postgres.query(`CREATE TABLE public.users (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    prefix VARCHAR(3) NOT NULL DEFAULT '${ket.config.DEFAULT_PREFIX}',
                    lang VARCHAR(2) DEFAULT 'pt',
                    commands NUMERIC CHECK(commands > -1) DEFAULT 1,
                    banned BOOLEAN NULL,
                    banReason TEXT NULL
                );`);
    }; try {
        await postgres.query(`SELECT * FROM servers`);
    } catch (e) {
        console.log(c.blue(`Criando tabela de dados para servidores`));
        await postgres.query(`CREATE TABLE public.servers (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    partner BOOLEAN NULL,
                    banned BOOLEAN NULL,
                    banreason TEXT NULL
                );`);
    }; try {
        await postgres.query(`SELECT * FROM commands`);
    } catch (e) {
        console.log(c.green(`Criando tabela de dados para comandos`))
        await postgres.query(`CREATE TABLE public.commands (
                    name TEXT NOT NULL PRIMARY KEY,
                    maintenance BOOLEAN NULL,
                    reason TEXT DEFAULT NULL
                  );`);
    }; try {
        await postgres.query(`SELECT * FROM globalchat`);
    } catch (e) {
        console.log(c.green(`Criando tabela de dados para globalchat`))
        await postgres.query(`CREATE TABLE public.globalchat (
                    id VARCHAR(20) NOT NULL PRIMARY KEY,
                    author VARCHAR(20) NOT NULL,
                    editcount NUMERIC DEFAULT 0,
                    messages VARCHAR(40)[] NULL
                  );`);
    }
    return;
}