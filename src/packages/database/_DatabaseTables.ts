import { Client } from "pg";

module.exports = class DatabaseTable {
    postgres: Client;
    constructor(postgres: Client) {
        this.postgres = postgres;
    }
    set(tableName: string, PrimaryKey: string) {
        let postgres = this.postgres;

        return {
            create: async (index: any, data: object, returnValue: boolean = false) => {
                if (!index) return false;

                let values: string[] = [],
                    isArray = Array.isArray(index);
                if (data) for (let i in Object.entries(data)) {
                    let value = String(data[Object.keys(data)[i]]).replace(new RegExp(`'`, 'g'), `''`);
                    typeof value === 'string' && !value.startsWith('sql') ? values.push(`'${value}'`) : values.push(String(value).replace('sql ', ''));
                }

                let SQLString = `INSERT INTO ${tableName}
                    ( ${PrimaryKey}${data ? `, ${Object.keys(data).join(', ')}` : ''} )
                    VALUES( '${index}'${data ? `, ${values.join(', ')}` : ''} );`
                try {
                    if (isArray) for (let i in index) {
                        SQLString = `INSERT INTO ${tableName}
                            ( ${PrimaryKey}${data ? `, ${Object.keys(data).join(', ')}` : ''} )
                            VALUES( '${index[i]}'${data ? `, ${values.join(', ')}` : ''} );
                        `;
                        await postgres.query(SQLString);
                    }
                    else await postgres.query(SQLString);

                    if (returnValue) return await global.session.db[tableName].find(index)
                    return true;
                } catch (e) {
                    global.session.log('error', 'DATABASE', `Falha ao CREATE documento na table ${tableName}\nSQL String: ${SQLString}`, e);
                    return false;
                }
            },
            update: async (index: string | string[], data: object, returnValue: boolean = false) => {
                if (!index) return false;

                let values: string[] = [];
                for (let [key, value] of Object.entries(data)) typeof value === 'string' && !value.startsWith('sql')
                    ? values.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`)
                    : values.push(`${key} = ${String(value).replace('sql ', '')}`);

                let SQLString = `UPDATE ${tableName} SET
                    ${values.join(`,\n`)}
                    WHERE ${PrimaryKey} = '${index}';
                `
                try {
                    if (Array.isArray(index)) for (let i in index) {
                        SQLString = `UPDATE ${tableName} SET
                            ${values.join(`,\n`)}
                            WHERE ${PrimaryKey} = '${index[i]}';`;
                        await postgres.query(SQLString);
                    }
                    else await postgres.query(SQLString);

                    if (returnValue) return await global.session.db[tableName].find(index);
                    return true;
                } catch (e) {
                    global.session.log('error', 'DATABASE', `Falha ao UPDATE documento na table ${tableName}\nSQL String: ${SQLString}`, e);
                    return false;
                }
            },
            delete: async (index: string) => {
                if (!index) return false;

                let SQLString = `DELETE FROM ${tableName}
                WHERE ${PrimaryKey} = '${index}'`;

                try {
                    if (Array.isArray(index)) for (let i in index) {
                        SQLString = `DELETE FROM ${tableName}
                        WHERE ${PrimaryKey} = '${index[i]}'`;
                        await postgres.query(SQLString);
                    }
                    else await postgres.query(SQLString);
                    return true;
                } catch (e) {
                    global.session.log('error', 'DATABASE', `Falha ao DELETE documento na table ${tableName}\nSQL String: ${SQLString}`, e);
                    return false;
                }
            },
            find: async (index: any, createIfNull: boolean = false) => {
                if (!index) return false;

                let SQLString = `SELECT * FROM ${tableName} 
                    WHERE ${PrimaryKey} = '${index}';`,
                    search,
                    isArray = Array.isArray(index);
                try {
                    if (isArray) {
                        search = [];
                        for (let i in index) {
                            SQLString = `SELECT * FROM ${tableName} 
                            WHERE ${PrimaryKey} = '${index[i]}';`;
                            search.push((await postgres.query(SQLString)).rows[0]);
                        }
                    } else search = (await postgres.query(SQLString)).rows[0];
                } catch (e) {
                    global.session.log('error', 'DATABASE', `Falha ao FIND documento na table ${tableName}\nSQL String: ${SQLString}`, e)
                    search = false;
                }
                return (!search || (isArray && !search[0])) && createIfNull
                    ? await global.session.db[tableName].create(index, null, true)
                    : search;
            },
            getAll: async (limit: number = null, orderBy: { key: string, type: string } = null) => {
                const SQLString = `SELECT * FROM ${tableName}
                ${orderBy ? `ORDER BY ${orderBy.key} ${orderBy.type}` : ''}
                ${limit ? `LIMIT ${limit}` : ''};
                `
                try {
                    return (await postgres.query(SQLString)).rows
                } catch (e) {
                    global.session.log('error', 'DATABASE', `Falha ao GETALL documento na table ${tableName}\nSQL String: ${SQLString}`, e)
                    return false;
                }
            }
        }
    }
}