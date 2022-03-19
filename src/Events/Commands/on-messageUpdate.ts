import { GuildChannel, Message, User } from "eris";
import { globalchat, guilds } from "../../JSON/settings.json";
import { PostgresClient } from "../../Components/Typings/Database";
import KetUtils from "../../Components/Core/KetUtils";
import KetClient from "../../Main";

module.exports = class MessageUpdateEvent {
    ket: KetClient;
    postgres: PostgresClient;
    KetUtils: any;
    constructor(ket: KetClient, postgres: PostgresClient) {
        this.ket = ket;
        this.postgres = postgres;
        this.KetUtils = new (KetUtils)(this.ket, this.postgres);
    }
    async on(newMsg: Message<any>, oldMsg: Message) {
        if ((String(oldMsg?.content).trim() === String(newMsg?.content).trim() && !newMsg.editedTimestamp) || newMsg.author?.bot) return;

        if (newMsg.channel.parentID === guilds.dmCategory) {
            let DMChannel = (await (await this.ket.findUser(newMsg.channel.topic) as User).getDMChannel()),
                msg = await this.ket.findMessage(DMChannel, { content: oldMsg.content, limit: 25 });

            this.ket.editMessage(DMChannel.id, msg.id, { content: newMsg.content })
                .catch((e) => this.ket.send({ ctx: newMsg.channel.msgID, content: `Não foi possível \`editar\` a sua mensagem\n\n${e}` }))

            return;
        }

        const guild = await this.postgres.servers.find(newMsg.guildID)

        if (newMsg.channel.id !== guild.globalchat) return this.ket.emit("messageCreate", newMsg);

        const user = await this.postgres.users.find(newMsg.author.id),
            msg = await this.postgres.globalchat.find(newMsg.id);

        if (user.banned || !msg || Date.now() > newMsg.timestamp + (15 * 1000 * 60) || Number(msg.editCount) >= globalchat.editLimit)
            return;

        msg.messages.forEach(async (data) => {
            let id = data.split('|')[0],
                server = await this.postgres.servers.find(data.split('|')[1]),
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
            })
                .catch(() => { })
        })

        await this.postgres.globalchat.update(msg.id, { editCount: msg.editCount });

        return;
    }
}