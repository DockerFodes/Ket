module.exports = class ShardDisconnect {
    ket: any;
    constructor(ket) {
        this.ket = ket;
    }
    async start(error, shardID) {
        global.client.log('error', "SHARDING MANAGER", `Shard ${shardID} morreu`);
        return this.ket.shardUptime.set(shardID, {
            shardID,
            uptime: NaN
        });
    }
}