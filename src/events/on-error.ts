module.exports = class ErrorEvent {
    async start(error: string, shardID: number) {
        return console.log(`SHARD ${shardID}`, error, 41);
    }
}