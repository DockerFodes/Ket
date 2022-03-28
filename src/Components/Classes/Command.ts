import { CommandContext } from "../Typings/Modules";
import { PostgresClient } from "../Typings/Modules";
import KetClient from "../../Main";

export default abstract class Command implements CommandConfig {
    dir: string;

    constructor(public ket: KetClient, public postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
    }

    abstract execute(ctx: CommandContext): Promise<void>;
}