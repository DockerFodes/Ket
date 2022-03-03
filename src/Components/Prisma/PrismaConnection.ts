import { PrismaClient } from "@prisma/client";
import { DEFAULT_PREFIX, DEFAULT_LANG } from "../../JSON/settings.json";

let template = {
    users: {
        prefix: DEFAULT_PREFIX,
        lang: DEFAULT_LANG,
        commands: 0,
        banned: false
    },
    servers: {
        lang: DEFAULT_LANG,
        globalchat: null,
        partner: null,
        banned: false
    }
}

type table = {
    create?(data: object);
    update?(data: object);
    find?(data: string | object, boolean?);
    delete?(data: object);

    findMany?(options?: object)
    findUnique?(options: object)
}

interface Prisma {
    $connect: Function;
    $disconnect: Function;
    ready: boolean;
    users: table;
    servers: table,
    commands: table;
    globalchat: table
    blacklist: table;
}

export default Prisma;

export async function connect(): Promise<Prisma> {
    let prisma = new PrismaClient()

    let db: Prisma = {
        $connect: prisma.$connect,
        $disconnect: prisma.$disconnect,
        ready: false,
        users: {},
        servers: {},
        commands: {},
        globalchat: {},
        blacklist: {}
    }

    await prisma.$connect()
        .then(() => {
            db.ready = true;
            console.log('DATABASE', '√ Banco de dados operante', 32)
        })
        .catch((error: Error) => console.log('DATABASE', `x Não foi possível realizar conexão ao banco de dados: ${error}`, 31));

    Object.keys(prisma).filter(key => !key.startsWith("_") && !key.startsWith('$')).forEach(key => {
        db[key] = { ...prisma[key] };
        db[key].find = async (queryData: any, createIfNull: boolean = false) => {
            typeof queryData === 'string' ? queryData = { where: { id: queryData } } : null;
            let res = (await prisma[key].findMany(queryData))[0];

            function compareProperties() {
                Object.entries(res).forEach(([property, value]) =>
                    !value && template[key][property]
                        ? res[property] = template[key][property]
                        : true
                )
                return res;
            }

            return res
                ? (template[key]
                    ? compareProperties()
                    : res)
                : (createIfNull
                    ? await prisma[key].create(queryData.where ? { data: queryData.where } : queryData)
                    : template[key]);
        }
    })
    return db;
}