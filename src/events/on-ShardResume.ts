import { Client } from "eris"

module.exports = class ShardResumeEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(shardID: number) {
        this.ket.emit('shardReady', shardID);
    }
}