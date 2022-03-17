interface dbTable<T> {
    create(index: string | string[], data?: T, returnValue?: boolean): Promise<T | T[] | boolean>;
    update(index: string | string[], data: T, createIfNull?: boolean, returnValue?: boolean): Promise<T | T[] | boolean>;
    find(index: string | string[], createIfNull?: boolean): Promise<T | T[] | boolean>;
    delete(index: string | string[]): Promise<T | T[] | boolean>;
    getAll(limit?: number, orderBy?: { key: string, type: string }): Promise<T[]>;
}

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
    warns: string;
}

interface PostgresClient {
    connect: () => Promise<boolean>;
    disconnect: () => Promise<boolean>;
    ready: boolean;
    tables: string[];
    users: dbTable<userSchema?>;
    servers: dbTable<serverSchema?>,
    commands: dbTable<commandSchema?>;
    globalchat: dbTable<globalchatSchema?>;
    blacklist: dbTable<blacklistSchema?>;
}