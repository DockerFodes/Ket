import { infoEmbed } from "../../Components/Commands/CommandStructure";
import KetClient from "../../Main";
module.exports = class ShardReadyEvent {
    ket: KetClient;
    constructor(ket: KetClient) {
        this.ket = ket;
    }
    async on(shardID: number) {
        console.log(`SHARD ${shardID}`, 'Conectada ao Discord', 34);
        this.ket.shardUptime.set(shardID, Date.now());
        infoEmbed(shardID, this.ket);
        return;
    }
}