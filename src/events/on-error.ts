module.exports = class ErrorEvent {
    async on(error: string, shardID: number) {
        return console.log(`SHARD ${shardID}`, error, 41);
    }
}