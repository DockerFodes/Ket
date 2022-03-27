import { CommandContext } from "../Typings/Modules";
import { PostgresClient } from "../Typings/Modules";
import KetClient from "../../Main";

export default abstract class Command {
    name?: string;
    aliases?: string[];
    category?: string;
    cooldown?: number;
    permissions?: {
        user?: string[];
        bot?: string[];
        onlyDevs?: boolean;
    }
    access?: {
        DM?: boolean;
        Threads?: boolean;
    }
    dontType?: boolean;
    testCommand?: string[];
    slash?: any;
    dir: string;

    constructor(public ket: KetClient, public postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
    }

    abstract execute(ctx: CommandContext): Promise<void>;
}