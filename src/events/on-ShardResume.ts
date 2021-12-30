import Eris from "eris";

module.exports = class ShardResumeEvent {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(shardID: number) {
        this.ket.emit('shardReady', shardID);
    }
}