import KetClient from "../../Main";
import TerminalClient from "../../Components/CLI/TerminalClient";
import BackupAndCacheController from "../../Packages/Database/_BackupAndCC";
import moment from "moment";
import { infoEmbed } from "../../Components/Commands/CommandStructure";

module.exports = class ReadyEvent {
    ket: KetClient;
    prisma: Prisma;
    constructor(ket: KetClient, prisma: Prisma) {
        this.ket = ket;
        this.prisma = prisma;
    }
    async on() {
        // this.ket.erela.init(this.ket.user.id);

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
            global.PROD
                ? infoEmbed(NaN, this.ket)
                : null;

            let now = moment.tz(Date.now(), "America/Bahia").format('H')
            //@ts-ignore
            this.ket.editStatus(now < 7 || now > 18 ? 'idle' : 'online', status[Math.floor(Math.random() * status.length)]);

            (await this.prisma.blacklist.findMany()).forEach(async user => {
                if (user.warns < 3 && Date.now() > Number(user.timeout)) {
                    await this.prisma.users.update({
                        where: { id: user.id },
                        data: { banned: null }
                    });
                    await this.prisma.blacklist.delete({ where: { id: user.id } });
                }
            });

            // Database Backup and Cache Controller
            if (++makeBackup >= 30) {
                await BackupAndCacheController(this.ket, this.prisma);
                makeBackup = 0;
            }
        }, 60_000)

        setInterval(() => {
            this.ket.users.filter(user => user.rateLimit > 0).forEach(u => u.rateLimit--);
            return;
        }, 5000);

        console.log('GATEWAY', `
  - Sessão iniciada como ${this.ket.user.tag}
 ◆ ▬▬▬▬▬▬▬▬▬▬▬▬▬ ❴ ✪ ❵ ▬▬▬▬▬▬▬▬▬▬▬▬▬ ◆
  - Operante em ${this.ket.guilds.size} servidores com ${this.ket.allUsersCount} membros.`, 33);
        TerminalClient(this.ket, this.prisma);
        return;
    }
}