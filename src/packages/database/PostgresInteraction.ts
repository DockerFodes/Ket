export { };
const
    c = require('chalk'),
    Postegrego = require('pg');
module.exports = class PostgresInteraction {
    constructor() {
        global.client.postgres = new Postegrego.Client({
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            database: process.env.DATABASE
        });
        global.client.db = {
            ready: false,
            disconnect: this.end,
            users: {
                create: this.createUser,
                update: this.updateUser,
                find: this.findUser,
                getAll: this.getAllUsers
            },
            servers: {
                create: this.createServer,
                update: this.updateServer,
                find: this.findServer,
                getAll: this.getAllServers
            },
            commands: {
                create: this.createCommand,
                update: this.updateCommand,
                find: this.findCommand,
                getAll: this.getAllCommands
            }
        };
    };
    /* Database Structure Functions */
    async inicialize() {
        const db = global.client.db;
        if (db.ready) return;
        console.log(`Conectando ao banco de dados...`);
        try {
            await global.client.postgres.connect();
            db.ready = true;
            global.client.log('log', 'DATABASE', '√ Banco de dados operante');
        } catch (error) {
            global.client.log('error', 'DATABASE', `x Não foi possível realizar conexão ao banco de dados, tentando novamente em 15 segundos...`, error);
            return setTimeout(() => this.inicialize(), 15000);
        };

        /* DATABASE TESTS */
        try {
            await global.client.postgres.query(`SELECT * FROM users`);
        } catch (e) {
            console.log(c.yellow(`Criando tabela de dados para usuários`));
            await global.client.postgres.query(`CREATE TABLE public.users (
                id VARCHAR(20) NOT NULL PRIMARY KEY,
                prefix VARCHAR(3) NOT NULL DEFAULT ',',
                lang VARCHAR(2) DEFAULT 'pt',
                commands NUMERIC CHECK(commands > -1) DEFAULT 1,
                banned BOOLEAN NULL,
                banReason TEXT NULL
            );`);
        }; try {
            await global.client.postgres.query(`SELECT * FROM servers`);
        } catch (e) {
            console.log(c.blue(`Criando tabela de dados para servidores`));
            await global.client.postgres.query(`CREATE TABLE public.servers (
                id VARCHAR(20) NOT NULL PRIMARY KEY,
                partner BOOLEAN NULL,
                banned BOOLEAN NULL,
                banreason TEXT NULL
            );`);
        }; try {
            await global.client.postgres.query(`SELECT * FROM commands`);
        } catch (e) {
            console.log(c.green(`Criando tabela de dados para comandos`))
            await global.client.postgres.query(`CREATE TABLE public.commands (
                name TEXT NOT NULL PRIMARY KEY,
                maintenance BOOLEAN NULL,
                reason TEXT DEFAULT NULL
              );`);
        }
        return;
    };
    async end() {
        return global.client.postgres.end();
    };
    /* Users Functions */
    async createUser(data: any, returnValue = false) {
        let values = [];
        for (let i in Object.entries(data)) {
            let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
            typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
        };
        await global.client.postgres.query(`INSERT INTO users (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`);
        if (returnValue) return await global.client.db.users.find(data.id);
        return;
    };
    async updateUser(index: string, data: object, returnValue = false) {
        let str = [];
        for (let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`);
        await global.client.postgres.query(`UPDATE users SET
            ${str.join(`,\n`)}
            WHERE id = '${index}';
        `);
        if (returnValue) return await global.client.db.users.find(index);
        return;
    };
    async findUser(id: string, createIfNull = false) {
        let search = await global.client.postgres.query(`SELECT * FROM users WHERE id = '${id}';`);
        if (!search.rows[0] && id !== null && createIfNull) {
            await global.client.db.users.create({ id: id });
            return await global.client.db.users.find(id);
        } else return search.rows[0];
    };
    async getAllUsers() {
        let search = await global.client.postgres.query(`SELECT * FROM users;`);
        return search.rows;
    };

    /* Servers Functions */
    async createServer(data: any, returnValue = false) {
        let values = [];
        for (let i in Object.entries(data)) {
            let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
            typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
        };
        await global.client.postgres.query(`INSERT INTO servers (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`);
        if (returnValue) return await global.client.db.servers.find(data.id);
        return;
    };
    async updateServer(index: string, data: object, returnValue: boolean = false) {
        let str = [];
        for (let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`);
        await global.client.postgres.query(`UPDATE servers SET
            ${str.join(`,\n`)}
            WHERE id = '${index}';
        `);
        if (returnValue) return await global.client.db.servers.find(index);
        return;
    };
    async findServer(id: string, createIfNull = false) {
        let search = await global.client.postgres.query(`SELECT * FROM servers WHERE id = '${id}';`);
        if (!search.rows[0] && id !== null && createIfNull) {
            await global.client.db.servers.create({ id: id });
            return await global.client.db.servers.find(id);
        } else return search.rows[0];
    };
    async getAllServers() {
        let search = await global.client.postgres.query(`SELECT * FROM servers;`);
        return search.rows;
    };

    /* Commands Functions */
    async createCommand(data: any, returnValue: boolean = null) {
        let values = [];
        for (let i in Object.entries(data)) {
            let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
            typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
        };
        await global.client.postgres.query(`INSERT INTO commands (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`);
        if (returnValue) return await global.client.db.commands.find(data.name);
        return;
    };
    async updateCommand(index: string, data: any, returnValue: boolean = null) {
        let str = [];
        for (let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`);
        await global.client.postgres.query(`UPDATE commands SET
            ${str.join(`,\n`)}
            WHERE name = '${index}';
        `);
        if (returnValue) return await global.client.db.commands.find(index);
        return;
    };
    async findCommand(name: string, createIfNull = false) {
        let search = await global.client.postgres.query(`SELECT * FROM commands WHERE name = '${name}';`);
        if (!search.rows[0] && name !== null && createIfNull) {
            await global.client.db.commands.create({ name: name });
            return await global.client.db.commands.find(name);
        } else return search.rows[0];
    };
    async getAllCommands() {
        let search = await global.client.postgres.query(`SELECT * FROM commands;`);
        return search.rows;
    };
};