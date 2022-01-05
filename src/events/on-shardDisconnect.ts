import { Client } from "eris"

module.exports = class ShardDisconnect {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(error: string, shardID: number) {
        this.ket.shards.get(shardID).editStatus('dnd', { name: 'Reconnecting...', type: 3 })
        global.session.log('error', "SHARDING MANAGER", `Shard ${shardID} morreu:`, error);
        return this.ket.shards.get(shardID).uptime = NaN;
    }
}