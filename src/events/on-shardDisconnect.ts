import Eris from "eris"

module.exports = class ShardDisconnect {
    ket: any;
    constructor(ket: Eris.Client) {
        this.ket = ket;
    }
    async start(error: string, shardID: number) {
        global.client.log('error', "SHARDING MANAGER", `Shard ${shardID} morreu:`, error);
        return this.ket.shardUptime.set(shardID, {
            shardID,
            uptime: NaN
        });
    }
}