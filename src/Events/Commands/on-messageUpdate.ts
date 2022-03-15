import KetClient from "../../Main";
import KetUtils from "../../Components/Core/KetUtils";
import { GuildChannel, Message } from "eris";
import { globalchat, guilds } from "../../JSON/settings.json";

module.exports = class MessageUpdateEvent {
    ket: KetClient;
    prisma: Prisma;
    KetUtils: any;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
        this.KetUtils = new (KetUtils)(this.ket, this.prisma);
    }
    async on(newMsg: Message<any>, oldMsg: Message) {
        if ((String(oldMsg?.content).trim() === String(newMsg?.content).trim() && !newMsg.editedTimestamp) || newMsg.author?.bot) return;

        if (newMsg.channel.parentID === guilds.dmCategory) {
            let DMChannel = (await (await this.ket.findUser(newMsg.channel.topic)).getDMChannel()),
                msg = await this.ket.findMessage(DMChannel, { content: oldMsg.content, limit: 25 });

            return this.ket.editMessage(DMChannel.id, msg.id, { content: newMsg.content })
                .catch((e) => this.ket.send({ ctx: newMsg.channel.msgID, content: `Não foi possível \`editar\` a sua mensagem\n\n${e}` }))
        }

        const guild = await this.prisma.servers.find(newMsg.guildID)

        if (newMsg.channel.id !== guild.globalchat) return this.ket.emit("messageCreate", newMsg);

        const user = await this.prisma.users.find(newMsg.author.id),
            msg = await this.prisma.globalchat.find(newMsg.id);

        if (user.banned || !msg || Date.now() > newMsg.timestamp + (15 * 1000 * 60) || Number(msg.editCount) >= globalchat.editLimit)
            return;

        msg.messages.forEach(async (data) => {
            let id = data.split('|')[0],
                server = await this.prisma.servers.find(data.split('|')[1]),
                channel: GuildChannel = this.ket.guilds.get(server.id).channels.get(server.globalchat),
                webhook = this.ket.webhooks.get(channel.id);

            if (!webhook) {
                webhook = (await this.ket.getChannelWebhooks(server.globalchat)).find(w => w.name === 'Ket' && w.user.id === this.ket.user.id);
                if (!webhook) return;
            }
            this.ket.editWebhookMessage(webhook.id, webhook.token, id, {
                content: this.KetUtils.msgFilter(newMsg.cleanContent),
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            }).catch(() => { })
        })

        await this.prisma.globalchat.update({
            where: { id: msg.id },
            data: { editCount: msg.editCount + 1 }
        })
        return;
    }
}