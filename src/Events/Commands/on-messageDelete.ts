import { GuildTextableChannel, Message, User } from "eris";
import { PostgresClient } from "../../Components/Typings/Database";
import { guilds } from "../../JSON/settings.json";
import KetClient from "../../Main";

module.exports = class MessageDeleteEvent {
    ket: KetClient;
    postgres: PostgresClient;
    constructor(ket: KetClient, postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
    }
    async on(message: Message<any>) {
        if (message.author?.bot) return;

        if (message.channel?.parentID === guilds.dmCategory) {
            let DMChannel = (await (await this.ket.findUser(message.channel.topic, false) as User).getDMChannel());

            return (await this.ket.findMessage(DMChannel, { content: message.content, limit: 25 })).delete()
                .catch((e) => this.ket.send({ ctx: message.channel, content: `Não foi possível \`apagar\` a mensagem\n\n\`\`\`js\n${e}\`\`\`` }))
        }

        let guild = await this.postgres.servers.find(message.guildID);
        if (message.channel.id !== guild.globalchat || Date.now() > message.timestamp + (15 * 1000 * 60)) return;

        let msgs = await this.postgres.globalchat.getAll(),
            msg = msgs.find((m) => m.id === message.id || msg.messages.find((ms) => ms.includes(message.id)));

        !msg ? null : msg.messages.forEach(async data => {

            let server = await this.postgres.servers.find(data.split('|')[1]),
                channel = this.ket.guilds.get(server.id).channels.get(server.globalchat) as GuildTextableChannel,
                msg: Message = await channel.getMessage(data.split('|')[0]),
                webhook = this.ket.webhooks.get(channel.id),
                hasDeleted: boolean = false;

            if (!msg) return;
            if (!webhook) {
                webhook = (await this.ket.getChannelWebhooks(server.globalchat))
                    .find(w => w.name === 'Ket' && w.user.id === this.ket.user.id);
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
            })
                .catch(() =>
                    !msg.attachments[0]
                        ? msg.delete()
                            .catch(() => { })
                        : null
                )
        })
        return;
    }
}