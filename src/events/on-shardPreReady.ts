import Eris from "eris";

module.exports = class ShardPreReadyEvent {
    ket: Eris.Client;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async execute(shardID: number) {
        this.ket.emit('shardReady', shardID);
    }
}