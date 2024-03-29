import { infoEmbed } from "../../Components/Commands/CommandStructure";
import { ENABLE_LAVALINK } from "../../JSON/settings.json";
import BackupAndCacheController from "../../Packages/Database/_BackupAndCC";
import TerminalClient from "../../Components/CLI/TerminalClient";
import Event from "../../Components/Classes/Event";
import moment from "moment";

module.exports = class Ready extends Event {
    public type = -1;
    public dir = __filename;

    public async on() {
        if (ENABLE_LAVALINK) this.ket.erela.init(this.ket.user.id);

        let status = [
            { name: 'no vasco', type: 0 },
            { name: 'sua mãe da janela', type: 0 },
            { name: 'sua mãe na panela', type: 0 },
            { name: "mais um gol do vasco", type: 3 },
            { name: "sua mãe gemendo", type: 2 },
            { name: 'Vasco x Flamengo', type: 5 },
            { name: 'Procurando o mundial do Palmeiras', type: 3 }
        ],
            makeBackup = 0;
        setInterval(async () => {
            if (global.PROD)
                infoEmbed(NaN, this.ket);

            let now = moment.tz(Date.now(), "America/Bahia").format('H')
            //@ts-ignore
            this.ket.editStatus(now < 7 || now > 18 ? 'idle' : 'online', status[Math.floor(Math.random() * status.length)]);

            (await this.postgres.blacklist.getAll())
                .forEach(async user => {
                    if (user.warns < 3 && Date.now() > Number(user.timeout)) {
                        await this.postgres.users.update(user.id, { banned: null });
                        await this.postgres.blacklist.delete(user.id);
                    }
                });

            // Database Backup and Cache Controller
            if (++makeBackup >= 30) {
                await BackupAndCacheController(this.ket, this.postgres);
                makeBackup = 0;
            }
        }, 60_000)

        setInterval(() => {
            this.ket.users
                .filter(user => user.rateLimit > 0)
                .forEach(u => u.rateLimit--);

            return;
        }, 5000);

        console.log('GATEWAY', `
  - Logged as ${this.ket.user.tag}
 ◆ ▬▬▬▬▬▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬▬▬▬▬▬ ◆
  - Working at ${this.ket.guilds.size} servers with ${this.ket.allUsersCount} member.`, 33);
        TerminalClient(this.ket, this.postgres);

        return;
    }
}