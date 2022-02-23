import KetClient from "../Main";
import Prisma from "../Components/Database/PrismaConnection";
import { Webhook, WebhookData } from "eris";

module.exports = class Event {
    ket: KetClient;
    prisma: Prisma;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
    }
    async on(wData: WebhookData) {
        if ((await this.prisma.servers.findMany({ where: { globalchat: wData.channelID } }))[0]) {
            let data = this.ket.webhooks.get(wData.channelID),
                guild = this.ket.guilds.get(wData.guildID),
                channel: any = guild?.channels?.get(wData.channelID);

            if (!guild || !channel || !channel.permissionsOf(this.ket.user.id).has('manageWebhooks')) return;
            let webhooks: Webhook[] = (await this.ket.getChannelWebhooks(wData.channelID)).filter((w: Webhook) => w.name === 'Ket' && w.user.id === this.ket.user.id);
            let webhook: any = webhooks[0];

            if (!webhooks[0])
                return webhook = await this.ket.createChannelWebhook(wData.channelID, { name: 'Ket' })
                    .then((w) => this.ket.webhooks.set(wData.channelID, w))
                    .catch(() => { })

            if (data && (webhook.name !== 'Ket' || webhook?.channel_id !== data.channel_id)) {
                console.log('editei um webhook pq fds, guild: ', guild.name)
                this.ket.editWebhook(webhook.id, {
                    name: 'Ket Global Chat',
                    channelID: wData.channelID
                }, webhook.token)
            }
        }
    }
}