import { Client } from "pg";
import { DEFAULT_PREFIX, DEFAULT_LANG } from "../../JSON/settings.json";

const template = {
    users: {
        prefix: DEFAULT_PREFIX,
        lang: DEFAULT_LANG,
        commands: 0,
        banned: false
    },
    servers: {
        lang: DEFAULT_LANG,
        globalchat: null,
        partner: false,
        banned: false
    },
    blacklist: {
        timeout: 0,
        warns: 0
    }
}

export default class DatabaseInteraction<T> {
    postgres: Client;
    tableName: string;
    primaryKey: string;

    constructor(tableName: string, primaryKey: string, postgres: Client) {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.postgres = postgres;
    }

    async create(index: string | string[], data?: Partial<T>, returnValue?: boolean): Promise<T | T[] | boolean> {
        if (!index) return false;

        let values = [];

        if (data)
            Object.entries(data)
                .forEach(([_key, value]) => {
                    value = String(value)
                        .replace(new RegExp(`'`, 'g'), `''`);

                    typeof value === 'string'
                        ? values.push(`'${value}'`)
                        : values.push(value);
                    return;
                })

        let SQLString = `
        INSERT INTO "${this.tableName}" (
            "${this.primaryKey}"${data
                ? `, "${Object.keys(data).join('", "')}"`
                : ''}
                )
            VALUES(
                '${index}'${data ? `, ${values.join(', ')}` : ''}
                );
        `
        try {
            if (Array.isArray(index))
                for (let i in index)
                    await this.postgres.query(SQLString.replace(String(index), index[i]));
            else await this.postgres.query(SQLString);

            if (returnValue) return await this.postgres[this.tableName].find(index);
            return true;
        } catch (e) {
            console.log(`DATABASE/CREATE/${this.tableName}`, `SQL: ${SQLString}\nErro: ${e.stack}`, 41);
            return false;
        }
    }

    async update(index: string | string[], data: Partial<T>, createIfNull?: boolean, returnValue?: boolean): Promise<T | T[] | boolean> {
        if (!index) return false;

        let values: string[] = [];

        Object.entries(data)
            .forEach(([key, value]) =>
                values.push(`"${key}" = ${typeof value === 'string'
                    ? `'${value.replace(new RegExp(`'`, 'g'), `''`)}'`
                    : String(value)}`)
            );

        let SQLString = `
        UPDATE "${this.tableName}" SET
            ${values.join(`,\n`)}
            WHERE "${this.primaryKey}" = '${index}';
        `
        try {
            if (Array.isArray(index))
                for (let i in index)
                    await this.postgres.query(SQLString.replace(String(index), index[i]));
            else await this.postgres.query(SQLString);

            if (returnValue) return await this.postgres[this.tableName].find(index);
            return true;
        } catch (e) {
            console.log(`DATABASE/UPDATE/${this.tableName}`, `SQL: ${SQLString}\nErro: ${e.stack}`, 41);
            return false;
        }
    }

    async find(index: string | string[], createIfNull?: boolean, key?: string): Promise<T> {
        if (!index) return null;

        let SQLString = `
        SELECT * FROM "${this.tableName}"

        WHERE "${key || this.primaryKey}" = '${index}';
        `,
            search: string[] | boolean = [];

        try {
            if (Array.isArray(index))
                for (let i in index) search.push(
                    this._resolveProperties(
                        (await this.postgres.query(SQLString.replace(String(index), index[i]))).rows[0]
                    )
                );
            else search = this._resolveProperties((await this.postgres.query(SQLString)).rows[0]);
        } catch (e) {
            console.log(`DATABASE/FIND/${this.tableName}`, `SQL: ${SQLString}\nErro: ${e.stack}`, 41);
            search = false;
        }

        return (!search || (Array.isArray(index) && !search[0])) && createIfNull
            ? await this.postgres[this.tableName].create(index, null, true)
            : search;
    }

    async delete(index: string | string[]): Promise<boolean> {
        if (!index) return false;

        let SQLString = `
        DELETE FROM "${this.tableName}"
        WHERE "${this.primaryKey}" = '${index}';
        `;

        try {
            if (Array.isArray(index))
                for (let i in index) await this.postgres.query(SQLString.replace(String(index), index[i]));
            else await this.postgres.query(SQLString);

            return true;
        } catch (e) {
            console.log(`DATABASE/DELETE/${this.tableName}`, `SQL: ${SQLString}\nErro: ${e.stack}`, 41);
            return false;
        }
    }

    async getAll(limit?: number, orderBy?: { key: string, type: string }, resolveProperties?: boolean): Promise<T[]> {
        const SQLString = `
        SELECT * FROM "${this.tableName}"
        ${orderBy
                ? `ORDER BY ${orderBy.key} ${orderBy.type}`
                : ''}
        ${limit ? `LIMIT ${limit}` : ''};
        `;

        try {
            let data = (await this.postgres.query(SQLString)).rows,
                resolvedData = [];

            if (resolveProperties)
                for (let i in data)
                    resolvedData.push(this._resolveProperties(data[i]));

            return resolveProperties ? resolvedData : data;
        } catch (e) {
            console.log(`DATABASE/GETALL/${this.tableName}`, `SQL: ${SQLString}\nErro: ${e.stack}`, 41);
            return null;
        }
    }

    async rowsCount() {
        const SQLString = `
        SELECT
            COUNT(${this.primaryKey})
            FROM ${this.tableName};
        `
        try {
            return (await this.postgres.query(SQLString))
                .rows[0].count;
        } catch (e) {
            console.log(`DATABASE/ROWSCOUNT/${this.tableName}`, `SQL: ${SQLString}\nErro: ${e.stack}`, 41);
        }
    }

    _resolveProperties(data) {
        if (!data) return;

        Object.entries(data)
            .forEach(([property, value]) =>
                !value && template[this.tableName] && template[this.tableName][property]
                    ? data[property] = template[this.tableName][property]
                    : true
            )

        return data;
    }
}