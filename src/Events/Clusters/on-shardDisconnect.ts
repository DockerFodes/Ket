import KetClient from "../../Main";

module.exports = class ShardDisconnect {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(error: string, shardID: number) {
        console.log(`SHARD ${shardID}`, `Reiniciando: ${error}`, 41);
        this.ket.shardUptime.set(shardID, NaN);
        return;
    }
}