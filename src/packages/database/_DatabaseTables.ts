import { Client } from "pg";

module.exports = class DatabaseTable {
    postgres: Client;
    constructor(postgres: Client) {
        this.postgres = postgres;
    }
    set(tableName: string, PrimaryKey: string) {
        let postgres = this.postgres;

        return {
            create: async (index: string, data: object, returnValue: boolean = false) => {
                if (!index) return false;

                let values: string[] = [];
                if (data) for (let i in Object.entries(data)) {
                    let value = String(data[Object.keys(data)[i]]).replace(new RegExp(`'`, 'g'), `''`);
                    typeof value === 'string' && !value.startsWith('sql') ? values.push(`'${value}'`) : values.push(String(value).replace('sql ', ''));
                }
                const SQLString = `INSERT INTO ${tableName}
                    ( ${PrimaryKey}${data ? `, ${Object.keys(data).join(', ')}` : ''} )
                    VALUES( '${index}'${data ? `, ${values.join(', ')}` : ''} );
                `
                await postgres.query(SQLString)
                    .catch((e) => global.session.log('error', 'DATABASE', `Falha ao CREATE documento na table ${tableName}\nSQL String: ${SQLString}`, e));
                if (returnValue) return await global.session.db[tableName].find(index);
                return;
            },
            update: async (index: string, data: object, returnValue: boolean = false) => {
                if (!index) return false;

                let values: string[] = [];
                for (let [key, value] of Object.entries(data)) typeof value === 'string' && !value.startsWith('sql') ? values.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : values.push(`${key} = ${String(value).replace('sql ', '')}`);

                const SQLString = `UPDATE ${tableName} SET
                    ${values.join(`,\n`)}
                    WHERE ${PrimaryKey} = '${index}';
                `
                await postgres.query(SQLString)
                    .catch((e) => global.session.log('error', 'DATABASE', `Falha ao UPDATE documento na table ${tableName}\nSQL String: ${SQLString}`, e));

                if (returnValue) return await global.session.db[tableName].find(index);
                return;
            },
            delete: async (index: string) => {
                if (!index) return false;

                const SQLString = `DELETE FROM ${tableName}
                WHERE ${PrimaryKey} = ${index}`
                return await global.session.postgres.query(SQLString)
                    .catch((e) => global.session.log('error', 'DATABASE', `Falha ao DELETE documento na table ${tableName}\nSQL String: ${SQLString}`, e));
            },
            find: async (index: string, createIfNull: boolean = false) => {
                if (!index) return false;
                const SQLString = `SELECT * FROM ${tableName} 
                    WHERE ${PrimaryKey} = '${index}';`
                try {
                    let search = await postgres.query(SQLString)
                    if (!search.rows[0] && index && createIfNull) return await global.session.db[tableName].create(index, null, true);
                    else return search.rows[0];
                } catch (e) {
                    global.session.log('error', 'DATABASE', `Falha ao FIND documento na table ${tableName}\nSQL String: ${SQLString}`, e)
                }
            },
            getAll: async (limit: number = null, orderBy: { key: string, type: string } = null) => {
                const SQLString = `SELECT * FROM ${tableName}
                ${orderBy ? `ORDER BY ${orderBy.key} ${orderBy.type}` : ''}
                ${limit ? `LIMIT ${limit}` : ''};
                `
                try {
                    let search = await postgres.query(SQLString);
                    return search.rows;
                } catch (e) {
                    return global.session.log('error', 'DATABASE', `Falha ao FIND documento na table ${tableName}\nSQL String: ${SQLString}`, e)
                }
            }
        }
    }
}