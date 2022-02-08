import { Message } from "eris";
import Prisma from "../Components/Database/PrismaConnection";
import KetClient from "../KetClient";
import KetUtils from "../Components/Core/KetUtils";
import { globalchat } from "../JSON/settings.json";

module.exports = class MessageUpdateEvent {
    ket: KetClient;
    prisma: Prisma;
    KetUtils: any;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
        this.KetUtils = new (KetUtils)(this.ket, this.prisma);
    }
    async on(newMessage: any, oldMessage: Message) {
        if ((String(oldMessage?.content).trim() === String(newMessage?.content).trim() && !newMessage.editedTimestamp) || newMessage.author?.bot) return;
        const guild = await this.prisma.servers.find(newMessage.guildID)

        if (newMessage.channel.id !== guild.globalchat) return this.ket.emit("messageCreate", newMessage);

        const user = await this.prisma.users.find(newMessage.author.id),
            msgData = await this.prisma.globalchat.find(newMessage.id);

        if (user.banned || !msgData) return;

        if (Date.now() > newMessage.timestamp + (15 * 1000 * 60) || Number(msgData.editCount) >= globalchat.editLimit) return;

        msgData.messages.forEach(async data => {
            let msgID = data.split('|')[0],
                guildData = await this.prisma.servers.find(data.split('|')[1]),
                channel: any = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat),
                webhook = this.ket.webhooks.get(channel.id);

            if (!webhook) {
                webhook = await channel.getWebhooks();
                webhook = Array(webhook).filter(w => w.name === 'Ket Global Chat' && w.user.id === this.ket.user.id)[0];
                if (!webhook) return;
            }
            this.ket.editWebhookMessage(webhook.id, webhook.token, msgID, {
                content: this.KetUtils.msgFilter(newMessage.cleanContent),
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            }).catch(() => { })
        })

        await this.prisma.globalchat.update({
            where: { id: msgData.id },
            data: { editCount: 'sql editCount + 1' }
        })

    }
}