import KetClient from "../KetClient";

module.exports = class ShardResumeEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(shardID: number) {
        return this.ket.emit('shardReady', shardID);
    }
}