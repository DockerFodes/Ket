import { GuildChannel, Message } from "eris";
import Prisma from "../Components/Database/PrismaConnection";
import KetClient from "../Main";

module.exports = class MessageDeleteEvent {
    ket: KetClient;
    prisma: Prisma;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
    }
    async on(message: Message<GuildChannel>) {
        let guild = await this.prisma.servers.find(message.guildID);
        if (message.channel.id !== guild.globalchat || Date.now() > message.timestamp + (15 * 1000 * 60) || message.author?.bot) return;

        let msgs = await this.prisma.globalchat.findMany(),
            msgData = msgs.filter(msg => msg.id === message.id || msg.messages.includes(message.id))[0];

        !msgData ? null : msgData.messages.forEach(async data => {

            let guildData = await this.prisma.servers.find(data.split('|')[1]),
                channel: any = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat),
                msg: Message = await channel.getMessage(data.split('|')[0]),
                webhook = this.ket.webhooks.get(channel.id),
                hasDeleted: boolean = false;

            if (!msg) return;
            if (!webhook) {
                webhook = await channel.getWebhooks();
                webhook = Array(webhook).filter(w => w.name === 'Ket Global Chat' && w.user.id === this.ket.user.id)[0];
                if (!webhook) return;
            }
            if (msg.attachments[0]) await msg.delete().then(() => hasDeleted = true).catch(() => hasDeleted = false)

            if (!hasDeleted) this.ket.editWebhookMessage(webhook.id, webhook.token, msg.id, {
                content: "```diff\n- [mensagem original apagada]```",
                file: [],
                embeds: [],
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            }).catch(() => !msg.attachments[0] ? msg.delete().catch(() => { }) : null)
        })
    }
}