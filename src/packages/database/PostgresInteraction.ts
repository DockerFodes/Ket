import c from "chalk"
import Postegrego from "pg"

module.exports = class PostgresInteraction {
    constructor() {
        global.postgres = new Postegrego.Client({
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            database: process.env.DATABASE
        })
        global.db = {
            ready: false,
            disconnect: this.end,
            query: this.insertQuery,
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
            },
        }
    }
        /* Database Structure Functions */
    async inicialize() {
        const db = global.db
        console.log(`Conectando ao banco de dados...`)
        try {
            await global.postgres.connect()
            db.ready = true
            global.log('log', 'DATABASE',  '√ Banco de dados operante',)
        } catch(error) {
            global.log('error', 'DATABASE',  `x Não foi possível realizar conexão ao banco de dados, tentando novamente em 15 segundos...`, error)
            return setTimeout(() => this.inicialize() , 15000)
        }
        
        /* DATABASE TESTS */
        try {
            await global.postgres.query(`SELECT * FROM users`)
        } catch(e) {
            console.log(c.yellow(`Criando tabela de dados para usuários`))
            await global.postgres.query(`CREATE TABLE public.users (
                id VARCHAR(20) NOT NULL PRIMARY KEY,
                prefix VARCHAR(3) NOT NULL DEFAULT ',',
                lang VARCHAR(2) DEFAULT 'pt',
                commands NUMERIC CHECK(commands > -1) DEFAULT 1,
                banned BOOLEAN NULL,
                banReason TEXT NULL
            );`)
        }; try {
            await global.postgres.query(`SELECT * FROM servers`)
        } catch(e) {
            console.log(c.blue(`Criando tabela de dados para servidores`))
            await global.postgres.query(`CREATE TABLE public.servers (
                id VARCHAR(20) NOT NULL PRIMARY KEY,
                commands NUMERIC CHECK(commands > -1) DEFAULT 0,
                partner BOOLEAN NULL,
                banned BOOLEAN NULL,
                banreason TEXT NULL
            );`)
        }; try {
            await global.postgres.query(`SELECT * FROM commands`)
        } catch (e) {
            console.log(c.green(`Criando tabela de dados para comandos`))
            await global.postgres.query(`CREATE TABLE public.commands (
                name TEXT NOT NULL PRIMARY KEY,
                maintenance BOOLEAN NULL,
                reason TEXT DEFAULT NULL
              );`)
        }
        return;
    }
    async end() {
        return global.postgres.end()
    }
    async insertQuery(message: string) {
        return await global.postgres.query(message)
    }
        /* Users Functions */
    async createUser(data: any, returnValue = false) {
        let values = []
        for(let i in Object.entries(data)) {
            let str = String(eval('data.'+Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`)
            typeof str === 'string' ? values.push(`'${str}'`) : values.push(str)
        }
        await global.postgres.query(`INSERT INTO users (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`)
        if(returnValue) return await global.db.users.find(data.id)
        else return;
    }
    async updateUser(index: string, data: object, returnValue = false) {
        let str = []
        for(let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`)
        await global.postgres.query(`UPDATE users SET
            ${str.join(`,\n`)}
            WHERE id = '${index}';
        `)
        return await global.db.users.find(index)
    }
    async findUser(id: string, createIfNull = false) {
        let search = await global.postgres.query(`SELECT * FROM users WHERE id = '${id}';`)
        if(!search.rows[0] && id !== null && createIfNull) {
            await global.db.users.create({id: id})
            return await global.db.users.find(id)
        } else return search.rows[0]
    }
    async getAllUsers() {
        let search = await global.postgres.query(`SELECT * FROM users;`)
        return search.rows
    }

    /* Servers Functions */
    async createServer(data: any, returnValue = false) {
        let values = []
        for(let i in Object.entries(data)) {
            let str = String(eval('data.'+Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`)
            typeof str === 'string' ? values.push(`'${str}'`) : values.push(str)
        }
        await global.postgres.query(`INSERT INTO servers (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`)
        if(returnValue) return await global.db.servers.find(data.id)
        else return;
    }
    async updateServer(index: string, data: object, returnValue: boolean = false) {
        let str = []
        for(let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`)
        await global.postgres.query(`UPDATE servers SET
            ${str.join(`,\n`)}
            WHERE id = '${index}';
        `)
        return await global.db.servers.find(index)
    }
    async findServer(id: string, createIfNull = false) {
        let search = await global.postgres.query(`SELECT * FROM servers WHERE id = '${id}';`)
        if(!search.rows[0] && id !== null && createIfNull) {
            await global.db.servers.create({id: id})
            return await global.db.servers.find(id)
        } else return search.rows[0]
    }
    async getAllServers() {
        let search = await global.postgres.query(`SELECT * FROM servers;`)
        return search.rows
    }

        /* Commands Functions */
    async createCommand(data: any) {
        let values = []
        for(let i in Object.entries(data)) {
            let str = String(eval('data.'+Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`)
            typeof str === 'string' ? values.push(`'${str}'`) : values.push(str)
        }
        await global.postgres.query(`INSERT INTO commands (${Object.keys(data).join(', ')}) VALUES(${values.join(', ')})`)
        return await global.db.commands.find(data.name)
    }
    async updateCommand(index: string, data: any) {
        let str = []
        for(let [key, value] of Object.entries(data)) typeof value === 'string' ? str.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : str.push(`${key} = ${value}`)
        await global.postgres.query(`UPDATE commands SET
            ${str.join(`,\n`)}
            WHERE name = '${index}';
        `)
        return await global.db.commands.find(index)
    }
    async findCommand(name: string, createIfNull = false) {
        let search = await global.postgres.query(`SELECT * FROM commands WHERE name = '${name}';`)
        if(!search.rows[0] && name !== null && createIfNull) {
            await global.db.commands.create({name: name})
            return await global.db.commands.find(name)
        } else return search.rows[0]
    }
    async getAllCommands() {
        let search = await global.postgres.query(`SELECT * FROM commands;`)
        return search.rows
    }
}