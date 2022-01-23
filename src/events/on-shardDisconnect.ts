import KetClient from "../KetClient";

module.exports = class ShardDisconnect {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async start(error: string, shardID: number) {
        this.ket.shards.get(shardID).editStatus('dnd', { name: 'Reconnecting...', type: 3 })
        console.log(`SHARD ${shardID}`, `Reiniciando: ${error}`, 41);
        return this.ket.shardUptime.set(shardID, NaN);
    }
}