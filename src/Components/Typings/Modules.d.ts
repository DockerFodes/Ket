import type { Message, Member, User, FileContent, Webhook, Guild, Shard, TextableChannel, GuildTextableChannel, AdvancedMessageContent, MessageContent } from "eris";
import type { dbTable, userSchema, serverSchema, commandSchema, globalchatSchema, blacklistSchema } from "./Database";
import type { CanvasRenderingContext2D, Image, CanvasImageData, CommandInteraction } from "canvas";
import type { Manager } from "erela.js";
import type { ESMap } from "typescript";
import type EventHandler from "../Core/EventHandler";
import type KetClient from "../../Main.ts";
import type pg from "pg";

interface dbTable<T> {
    async create(index: string | string[], data?: Partial<T>, returnValue?: boolean): Promise<T | T[] | boolean>;
    async update(index: string | string[], data: Partial<T>, createIfNull?: boolean, returnValue?: boolean): Promise<T | T[] | boolean>;
    async find(index: string | string[], createIfNull?: boolean, key?: string): Promise<T>;
    async delete(index: string | string[]): Promise<boolean>;
    async getAll(limit?: number, orderBy?: { key: string, type: string }, resolveProperties?: boolean): Promise<T[]>;
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
    warns: number;
}

interface clientMethods {
    end: () => Promise<void>;
    ready: boolean;
    tables: string[];
    users: dbTable<userSchema>;
    servers: dbTable<serverSchema>,
    commands: dbTable<commandSchema>;
    globalchat: dbTable<globalchatSchema>;
    blacklist: dbTable<blacklistSchema>;
}

declare module 'pg' {
    interface Client extends clientMethods {
        build: () => Promise<clientMethods>;
    }
}

export type PostgresClient = pg.Client & clientMethods;

declare module 'eris' {
    interface Client extends KetClient {
        _token: string;
        events: EventHandler;
        commands: Collection<string, any>;
        aliases: Collection<string, string>;
        webhooks: Collection<string, Webhook>;
        erela: Manager;
        shardUptime: Collection<string | number, number>;
        rootDir: string;
    }

    interface Message {
        cleanContent: string;
        deleteAfter(time: number): void;
    }

    interface Member {
        mute(args: string, reason?: string): boolean | never;
    }

    interface User {
        _client: Client;
        rateLimit: number;
        tag: string;
        lastCommand: {
            botMsg: string;
            userMsg: string;
        }
    }
}

declare module 'canvas' {
    interface CanvasRenderingContext2D {
        roundRect(x: number, y: number, width: number, height: number, radius: number, fill: Function, stroke: boolean): void;
        getLines(text: string, maxWidth: number): string;
        roundImageCanvas(img: Image, w?: number, h?: number, r?: number): CanvasImageData;
    }
}


export interface CommandContextFunc {
    ket: KetClient;
    postgres: PostgresClient;
    message?: Message<any>;
    interaction?: CommandInteraction<any>;
    user: userSchema;
    server: serverSchema;
    args?: string[];
    command?: CommandConfig;
    commandName?: string,
    t(lang: string, placeholders?: object, language?: string)
}

interface CommandContext {
    postgres: PostgresClient;
    config: any;
    env: Message<any> | CommandInteraction<any>;
    send: Function;
    user: userSchema;
    server: serverSchema;
    args: string[];
    author: User;
    uID: string;
    member: Member;
    guild: Guild;
    gID: string;
    me: Member;
    shard: Shard;
    channel: TextableChannel;
    cID: string;
    command: CommandConfig;
    commandName: string;
    t: Function;
}

interface KetSendContent extends AdvancedMessageContent {
    file?: FileContent;
    files?: FileContent[];
}

export interface CommandConfig {
    name: string;
    aliases: string[];
    cooldown: number;
    permissions: {
        user: string[];
        bot: string[];
        onlyDevs: boolean;
    }
    access: {
        DM: boolean;
        Threads: boolean;
    }
    dontType: boolean;
    testCommand: string[];
    data: any;
    config: CommandConfig;
}

export interface KetSendFunction {
    ctx: Message<any> | CommandInteraction<any> | CommandContext | string;
    content: KetSendContent | string;
    emoji?: string;
    embed?: boolean;
    target?: 0 | 1 | 2;
}