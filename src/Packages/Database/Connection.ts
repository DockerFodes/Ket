import { Client } from "pg";
import { blacklistSchema, commandSchema, globalchatSchema, serverSchema, userSchema } from "../../Components/Typings/Database";
import table from "./_Interaction";

export default async () => {
    let postgres = new Client({
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
        user: process.env.USER,
        host: process.env.HOST,
        port: Number(process.env.PORT),
        ssl: process.env.SSL == 'false' ? false : { rejectUnauthorized: false }
    });

    await postgres.connect()
        .then(() => {
            postgres.users = new table<userSchema>('users', 'id', postgres);
            postgres.servers = new table<serverSchema>('servers', 'id', postgres);
            postgres.commands = new table<commandSchema>('commands', 'name', postgres);
            postgres.globalchat = new table<globalchatSchema>('globalchat', 'id', postgres);
            postgres.blacklist = new table<blacklistSchema>('blacklist', 'id', postgres);
            postgres.tables = ['users', 'servers', 'commands', 'globalchat', 'blacklist'];

            console.log('DATABASE', '√ Banco de dados operante', 32);
        })
        .catch((error) => console.log('DATABASE', `x Não foi possível realizar conexão ao banco de dados: ${error}`, 41))

    /* DATABASE TESTS */
    await postgres.query(`SELECT id FROM public.users;`)
        .catch(async () => {
            console.log('DATABASE', 'Criando table users', 2);
            await postgres.query(`
            CREATE TABLE "users" (
                "id" VARCHAR(20) NOT NULL PRIMARY KEY,
                "prefix" VARCHAR(3),
                "lang" VARCHAR(2),
                "commands" INTEGER NOT NULL,
                "banned" TEXT            
            );`)
        })

    await postgres.query(`SELECT id FROM public.servers;`)
        .catch(async () => {
            console.log('DATABASE', 'Criando table servers', 2);
            await postgres.query(`
            CREATE TABLE "servers" (
                "id" VARCHAR(20) NOT NULL PRIMARY KEY,
                "lang" VARCHAR(2),
                "globalchat" VARCHAR(20),
                "partner" BOOLEAN,
                "banned" TEXT
            );`)
        })

    await postgres.query(`SELECT name FROM public.commands;`)
        .catch(async () => {
            console.log('DATABASE', 'Criando table commands', 2);
            await postgres.query(`
            CREATE TABLE "commands" (
                "name" TEXT NOT NULL PRIMARY KEY,
                "maintenance" BOOLEAN,
                "reason" TEXT
            );`)
        })

    await postgres.query(`SELECT id FROM public.globalchat;`)
        .catch(async () => {
            console.log('DATABASE', 'Criando table globalchat', 2);
            await postgres.query(`
            CREATE TABLE "globalchat" (
                "id" VARCHAR(20) NOT NULL PRIMARY KEY,
                "guild" VARCHAR(20) NOT NULL,
                "author" VARCHAR(20) NOT NULL,
                "editCount" INTEGER NOT NULL DEFAULT 0,
                "messages" VARCHAR(40)[]
            );`)
        })

    await postgres.query(`SELECT id FROM public.blacklist;`)
        .catch(async () => {
            console.log('DATABASE', 'Criando table blacklist', 2);
            await postgres.query(`
            CREATE TABLE "blacklist" (
                "id" VARCHAR(20) NOT NULL PRIMARY KEY,
                "timeout" INTEGER NOT NULL,
                "warns" INTEGER NOT NULL DEFAULT 1
            );`)
        })

    return postgres;
}