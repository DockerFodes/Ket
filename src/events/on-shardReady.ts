import KetClient from "../KetClient";

module.exports = class ShardReadyEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(shardID: number) {
        global.session.log('shard', "SHARDING MANAGER", `Shard ${shardID} acordou`);
        return this.ket.shardUptime.set(shardID, Date.now());
    }
}