import KetClient from "../Main";

module.exports = class ShardDisconnect {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(error: string, shardID: number) {
        console.log(`SHARD ${shardID}`, `Reiniciando: ${error}`, 41);
        return this.ket.shardUptime.set(shardID, NaN);
    }
}