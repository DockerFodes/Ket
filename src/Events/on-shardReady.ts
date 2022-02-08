import KetClient from "../KetClient";

module.exports = class ShardReadyEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(shardID: number) {
        console.log(`SHARD ${shardID}`, 'Conectada ao Discord', 34);
        return this.ket.shardUptime.set(shardID, Date.now());
    }
}