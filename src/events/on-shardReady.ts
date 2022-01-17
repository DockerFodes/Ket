import { Client } from "eris"

module.exports = class ShardReadyEvent {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(shardID: number) {
        global.session.log('shard', "SHARDING MANAGER", `Shard ${shardID} acordou`);
        return this.ket.shards.get(shardID).uptime = Date.now();
    }
}