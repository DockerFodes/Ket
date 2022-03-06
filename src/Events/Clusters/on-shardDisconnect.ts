import { infoEmbed } from "../../Components/Commands/CommandStructure";
import KetClient from "../../Main";

module.exports = class ShardDisconnect {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(error: string, shardID: number) {
        console.log(`SHARD ${shardID}`, `Reiniciando: ${error}`, 31);
        this.ket.shardUptime.set(shardID, NaN);
        infoEmbed(shardID, this.ket);
        return;
    }
}