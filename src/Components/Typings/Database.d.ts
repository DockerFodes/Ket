import pg from "pg";

interface dbTable<T> {
    create(index: string | string[], data?: Partial<T>, returnValue?: boolean): Promise<T | T[] | boolean>;
    update(index: string | string[], data: Partial<T>, createIfNull?: boolean, returnValue?: boolean): Promise<T | T[] | boolean>;
    find(index: string | string[], createIfNull?: boolean, key?: string): Promise<T>;
    delete(index: string | string[]): Promise<boolean>;
    getAll(limit?: number, orderBy?: { key: string, type: string }, resolveProperties?: boolean): Promise<T[]>;
}

type responseTypes = boolean | null | userSchema | serverSchema | commandSchema
    | globalchatSchema | blacklistSchema | responseTypes[]

interface userSchema {
    id: string;
    prefix?: string;
    lang?: string;
    commands: number;
    banned?: string;
}

interface serverSchema {
    id: string;
    lang?: string;
    globalchat?: string;
    partner?: boolean;
    banned?: string;
}

interface commandSchema {
    name: string;
    maintenance?: boolean;
    reason?: string;
}

interface globalchatSchema {
    id: string;
    guild: string;
    author: string;
    editCount: number;
    messages: string[];
}

interface blacklistSchema {
    id: string;
    timeout: number;
    warns: number;
}

interface PostgresClient extends pg.Client {
    connect: () => Promise<boolean>;
    disconnect: () => Promise<boolean>;
    ready: boolean;
    tables: string[];
    users: dbTable<userSchema>;
    servers: dbTable<serverSchema>,
    commands: dbTable<commandSchema>;
    globalchat: dbTable<globalchatSchema>;
    blacklist: dbTable<blacklistSchema>;
} 