import { PostgresClient } from "../Typings/Modules";
import ketUtils from "../Core/KetUtils";
import KetClient from "../../Main";

export default abstract class Event {
    name?: string;
    category?: string;
    type: number;
    disabled?: boolean
    KetUtils: any;

    constructor(public ket: KetClient, public postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
        this.KetUtils = new (ketUtils)(ket, postgres);
    }

    abstract on(...args: any): Promise<void>;
}