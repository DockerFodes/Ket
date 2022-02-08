import { DEFAULT_PREFIX, DEFAULT_LANG } from "../../JSON/settings.json";

type table = {
    create(data: object);
    update(data: object);
    find(data: string | object, boolean?);
    delete(data: object);

    findMany(options?: object)
    findUnique(options: object)
}

type Prisma = {
    $connect: Function;
    $disconnect: Function;
    users: table;
    servers: table,
    commands: table;
    globalchat: table
    blacklist: table;
}

export default Prisma;

export async function connect(/*ket: KetClient,*/ prisma: any) {
    let template = {
        users: {
            prefix: DEFAULT_PREFIX,
            lang: DEFAULT_LANG,
            commands: 1,
            banned: null
        },
        servers: {
            lang: DEFAULT_LANG,
            globalchat: null,
            partner: null,
            banned: null
        }
    }
    let db: any = {
        $connect: prisma.$connect,
        $disconnect: prisma.$disconnect,
        users: {},
        servers: {},
        commands: {},
        globalchat: {},
        blacklist: {}
    }
    await prisma.$connect()
        .then(() => console.log('DATABASE', '√ Banco de dados operante', 32))
        .catch((error: Error) => console.log('DATABASE', `x Não foi possível realizar conexão ao banco de dados: ${error}`, 41))

    Object.keys(prisma).filter(key => !key.startsWith("_") && !key.startsWith('$')).forEach(key => {
        db[key] = { ...prisma[key] };
        db[key].find = async (queryData: string | object, createIfNull: boolean = false) => {
            typeof queryData === 'string' ? queryData = { where: { id: queryData } } : queryData = { data: { id: queryData } };

            let res = await prisma[key].findUnique(queryData);
            return !res
                ? (createIfNull
                    ? await prisma[key].create(queryData)
                    : template[key])
                : res;
        }
    })

    if (!global.PRODUCTION_MODE) return db;
    // async function backupAndCacheController() {
    //     //  Backup da database
    //     Object.entries(prisma)
    //         .filter(([key]) => !key.startsWith("_") && !key.startsWith('$'))
    //         .forEach(async ([key, value]) => typeof value === 'object'
    //             ? ket.createMessage(ket.config.channels.database, `Backup da table \`${key}\``,
    //                 { name: `${key}.json`, file: await prisma[key].findMany() })
    //             : null);

    //     //  cache controller
    //     let users = (await prisma.users.findMany()).map(u => u.id),
    //         nonCached = [];

    //     ket.users.forEach((u) => !users.includes(u.id) && u.id !== ket.user.id
    //         ? ket.users.delete(u.id)
    //         : null
    //     );

    //     users.forEach(user => !ket.users.has(user) ? nonCached.push(user) : null);
    //     for (let i in nonCached) {
    //         global.sleep(5);
    //         await ket.getRESTUser(nonCached[i]);
    //     }
    // }
    // setInterval(() => backupAndCacheController(), 60_000 * 30);
    // backupAndCacheController();
    // return db;
}