import KetClient from "../../Main";
import { GuildChannel, GuildTextableChannel, Message } from "eris";
import { guilds } from "../../JSON/settings.json";
module.exports = class MessageDeleteEvent {
    ket: KetClient;
    prisma: Prisma;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
    }
    async on(message: Message<any>) {
        if (message.author?.bot) return;

        if (message.channel?.parentID === guilds.dmCategory) {
            let DMChannel = (await (await this.ket.findUser(message.channel.topic, false)).getDMChannel());
            return (await this.ket.findMessage(DMChannel, { content: message.content, limit: 25 })).delete()
                .catch((e) => this.ket.send({ ctx: message.channel, content: `Não foi possível \`apagar\` a mensagem\n\n\`\`\`js\n${e}\`\`\`` }))
        }

        let guild = await this.prisma.servers.find(message.guildID);
        if (message.channel.id !== guild.globalchat || Date.now() > message.timestamp + (15 * 1000 * 60)) return;

        let msgs = await this.prisma.globalchat.findMany(),
            msgData = msgs.filter(msg => msg.id === message.id || msg.messages.includes(message.id))[0];

        !msgData ? null : msgData.messages.forEach(async data => {

            let guildData = await this.prisma.servers.find(data.split('|')[1]),
                channel = this.ket.guilds.get(guildData.id).channels.get(guildData.globalchat) as GuildTextableChannel,
                msg: Message = await channel.getMessage(data.split('|')[0]),
                webhook = this.ket.webhooks.get(channel.id),
                hasDeleted: boolean = false;

            if (!msg) return;
            if (!webhook) {
                webhook = (await this.ket.getChannelWebhooks(guildData.globalchat)).find(w => w.name === 'Ket' && w.user.id === this.ket.user.id);
                if (!webhook) return;
            }
            if (msg.attachments[0]) await this.ket.deleteWebhookMessage(webhook.id, webhook.token, msg.id)
                .then(() => hasDeleted = true)
                .catch(() => hasDeleted = false)

            if (!hasDeleted) this.ket.editWebhookMessage(webhook.id, webhook.token, msg.id, {
                content: "```diff\n- [mensagem original apagada]```",
                file: [],
                embeds: [],
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false
                }
            }).catch(() => !msg.attachments[0] ? this.ket.deleteWebhookMessage(webhook.id, webhook.token, msg.id).catch(() => { msg.delete().catch(() => { }) }) : null)
        })
        return;
    }
}