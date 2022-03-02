import KetClient from "../../Main";
import Prisma from "../../Components/Prisma/PrismaConnection";
import { RawPacket } from "eris";

module.exports = class Event {
    ket: KetClient;
    prisma: Prisma;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
    }
    async on(packet: RawPacket) {
        this.ket.erela.updateVoiceState(packet);
        return;
    }
}