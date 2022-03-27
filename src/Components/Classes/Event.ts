import { PostgresClient } from "../Typings/Modules";
import KetClient from "../../Main";
import ketUtils from "../Core/KetUtils";

export default abstract class Event {
    name?: string;
    category?: string;
    type: number;
    disabled?: boolean
    KetUtils: any;
    dir: string;

    constructor(public ket: KetClient, public postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
        this.KetUtils = new (ketUtils)(ket, postgres);
    }

    abstract on(...args: any): Promise<void>;
}