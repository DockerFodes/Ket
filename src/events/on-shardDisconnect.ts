import { Client } from "eris"

module.exports = class ShardDisconnect {
    ket: Client;
    constructor(ket: Client) {
        this.ket = ket;
    }
    async start(error: string, shardID: number) {
        global.session.log('error', "SHARDING MANAGER", `Shard ${shardID} morreu:`, error);
        return this.ket.shardUptime.set(shardID, {
            shardID,
            uptime: NaN
        });
    }
}