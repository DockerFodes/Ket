import { Client } from "pg";

module.exports = class DatabaseTable {
    table: {
        create: Function,
        update: Function,
        find: Function,
        getAll: Function
    }
    postgres: Client;
    constructor(postgres: Client) {
        this.postgres = postgres;
        this.table;
    }
    set(tableName: string, PrimaryKey: string) {
        let postgres = this.postgres;

        this.table = {
            create: async (index: string, data: object, returnValue: boolean = false) => {
                let values = [];
                if (data) for (let i in Object.entries(data)) {
                    let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
                    typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
                }
                await postgres.query(`INSERT INTO ${tableName} (${PrimaryKey}${data ? `, ${Object.keys(data).join(', ')}` : ''}) VALUES('${index}'${data ? `, ${values.join(', ')}` : ''})`);
                if (returnValue) return await global.session.db[tableName].find(index);
                return;
            },
            update: async (index: string, data: object, returnValue: boolean = false) => {
                let values: string[] = [];
                for (let [key, value] of Object.entries(data)) typeof value === 'string' ? values.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : values.push(`${key} = ${value}`);
                await postgres.query(`UPDATE ${tableName} SET
                        ${values.join(`,\n`)}
                        WHERE ${PrimaryKey} = '${index}';
                    `);
                if (returnValue) return await global.session.db[tableName].find(index);
                return;
            },
            find: async (index: string, createIfNull: boolean = false) => {
                let search = await postgres.query(`SELECT * FROM ${tableName} WHERE ${PrimaryKey} = '${index}';`);
                if (!search.rows[0] && index && createIfNull) return await global.session.db[tableName].create(index, null, true);
                else return search.rows[0];
            },
            getAll: async (limit: number, orderBy = { key: PrimaryKey, type: 'ASC' }) => {
                let search = await postgres.query(`SELECT * FROM ${tableName}
                ${orderBy ? `ORDER BY ${orderBy.key} ${orderBy.type}` : ''}
                LIMIT ${limit ? limit : 'ALL'}
                ;`);
                return search.rows;
            }
        }

        return this.table;
    }
}