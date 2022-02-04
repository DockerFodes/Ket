import { Client } from "pg";
import db from "../db";

export default class DatabaseInteraction {
    postgres: Client;
    tableName: string;
    primaryKey: string;
    constructor(tableName: string, primaryKey: string, postgres: Client) {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.postgres = postgres;
    }

    async create(index: any, data: object, returnValue: boolean = false) {
        if (!index) return false;

        let values: string[] = [],
            isArray = Array.isArray(index);
        if (data) for (let i in Object.entries(data)) {
            let value = String(data[Object.keys(data)[i]]).replace(new RegExp(`'`, 'g'), `''`);
            typeof value === 'string' && !value.startsWith('sql') ? values.push(`'${value}'`) : values.push(String(value).replace('sql ', ''));
        }

        let SQLString = `INSERT INTO ${this.tableName}
            ( ${this.primaryKey}${data ? `, ${Object.keys(data).join(', ')}` : ''} )
            VALUES( '${index}'${data ? `, ${values.join(', ')}` : ''} );`
        try {
            if (isArray) for (let i in index) {
                SQLString = `INSERT INTO ${this.tableName}
                    ( ${this.primaryKey}${data ? `, ${Object.keys(data).join(', ')}` : ''} )
                    VALUES( '${index[i]}'${data ? `, ${values.join(', ')}` : ''} );
                `;
                await this.postgres.query(SQLString);
            }
            else await this.postgres.query(SQLString);

            if (returnValue) return await db[this.tableName].find(index)
            return true;
        } catch (e) {
            console.log(`DATABASE/CREATE ON ${this.tableName}`, `SQL: ${SQLString} Erro: ${e}`, 41);
            return false;
        }
    }

    async update(index: string | string[], data: object, returnValue: boolean = false) {
        if (!index) return false;

        let values: string[] = [];
        for (let [key, value] of Object.entries(data)) typeof value === 'string' && !value.startsWith('sql')
            ? values.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`)
            : values.push(`${key} = ${String(value).replace('sql ', '')}`);

        let SQLString = `UPDATE ${this.tableName} SET
            ${values.join(`,\n`)}
            WHERE ${this.primaryKey} = '${index}';
        `
        try {
            if (Array.isArray(index)) for (let i in index) {
                SQLString = `UPDATE ${this.tableName} SET
                    ${values.join(`,\n`)}
                    WHERE ${this.primaryKey} = '${index[i]}';`;
                await this.postgres.query(SQLString);
            }
            else await this.postgres.query(SQLString);

            if (returnValue) return await db[this.tableName].find(index);
            return true;
        } catch (e) {
            console.log(`DATABASE/UPDATE ON ${this.tableName}`, `SQL: ${SQLString} Erro: ${e}`, 41);
            return false;
        }
    }

    async delete(index: string) {
        if (!index) return false;

        let SQLString = `DELETE FROM ${this.tableName}
        WHERE ${this.primaryKey} = '${index}'`;

        try {
            if (Array.isArray(index)) for (let i in index) {
                SQLString = `DELETE FROM ${this.tableName}
                WHERE ${this.primaryKey} = '${index[i]}'`;
                await this.postgres.query(SQLString);
            }
            else await this.postgres.query(SQLString);
            return true;
        } catch (e) {
            console.log(`DATABASE/DELETE ON ${this.tableName}`, `SQL: ${SQLString} Erro: ${e}`, 41);
            return false;
        }
    }

    async find(index: any, createIfNull: boolean = false) {
        if (!index) return false;

        let SQLString = `SELECT * FROM ${this.tableName} 
            WHERE ${this.primaryKey} = '${index}';`,
            search,
            isArray = Array.isArray(index);
        try {
            if (isArray) {
                search = [];
                for (let i in index) {
                    SQLString = `SELECT * FROM ${this.tableName} 
                    WHERE ${this.primaryKey} = '${index[i]}';`;
                    search.push((await this.postgres.query(SQLString)).rows[0]);
                }
            } else search = (await this.postgres.query(SQLString)).rows[0];
        } catch (e) {
            console.log(`DATABASE/FIND ON ${this.tableName}`, `SQL: ${SQLString} Erro: ${e}`, 41);
            search = false;
        }
        return (!search || (isArray && !search[0])) && createIfNull
            ? await db[this.tableName].create(index, null, true)
            : search;
    }

    async getAll(limit: number = null, orderBy: { key: string, type: string } = null) {
        const SQLString = `SELECT * FROM ${this.tableName}
        ${orderBy ? `ORDER BY ${orderBy.key} ${orderBy.type}` : ''}
        ${limit ? `LIMIT ${limit}` : ''};
        `
        try {
            return (await this.postgres.query(SQLString)).rows
        } catch (e) {
            console.log(`DATABASE/GETALL ON ${this.tableName}`, `SQL: ${SQLString} Erro: ${e}`, 41);
            return false;
        }
    }
}