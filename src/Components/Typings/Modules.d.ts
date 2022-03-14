import type { CanvasRenderingContext2D, Image, CanvasImageData, CommandInteraction } from "canvas";
import type { Message, Member, User, Client, Webhook, Guild, Shard, TextableChannel, GuildTextableChannel, AdvancedMessageContent, MessageContent } from "eris";
import type { ESMap } from "typescript";
import type { Manager } from "erela.js";
import type KetClient from "../../Main.ts";
import type EventHandler from "../Core/EventHandler";

declare module 'eris' {
	interface Client extends KetClient {
		_token: string;
		events: EventHandler;
		commands: ESMap<string, any>;
		aliases: ESMap<string, string>;
		webhooks: ESMap<string, Webhook>;
		erela: Manager;
		shardUptime: ESMap<string | number, number>;
		rootDir: string;
	}

	interface Message {
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
    prisma: Prisma;
    message?: Message<any>;
    interaction?: CommandInteraction<any>;
    user: any;
    server: any;
    args?: string[];
    command?: any;
    commandName?: string,
    t(lang: string, placeholders?: object, language?: string)
}

interface CommandContext {
    prisma: Prisma;
    config: any;
    env: Message<any> | CommandInteraction<any>;
    send: Function;
    user: any;
    server: any;
    args: any[];
    author: User;
    uID: string;
    member: Member;
    guild: Guild;
    gID: string;
    me: Member;
    shard: Shard;
    channel: TextableChannel | GuildTextableChannel;
    cID: string;
    command: any;
    commandName: string;
    t: Function;
}

interface KetSendContent extends AdvancedMessageContent {
    file?: FileContent;
    files?: FileContent[];
}

export interface KetSendFunction {
    ctx: Message<any> | CommandInteraction<any> | CommandContext | string;
    content: KetSendContent | string;
    emoji?: string;
    embed?: boolean;
    target?: 0 | 1 | 2;
}