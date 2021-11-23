module.exports = class ShardDisconnect {
    ket: any
    constructor(ket) {
        this.ket = ket
    }
    async start(error, shardID) {
        global.log('error', "SHARDING MANAGER", `Shard ${shardID} desconectada`)
        return this.ket.shardUptime.set(shardID, {
            shardID,
            uptime: NaN
          })
    }
}