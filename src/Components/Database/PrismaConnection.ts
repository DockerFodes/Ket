import { PrismaClient } from "@prisma/client";
import { DEFAULT_PREFIX, DEFAULT_LANG } from "../../JSON/settings.json";

type table = {
    create?(data: object);
    update?(data: object);
    find?(data: string | object, boolean?);
    delete?(data: object);

    findMany?(options?: object)
    findUnique?(options: object)
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

export function connect(prisma: PrismaClient): Prisma {
    let template = {
        users: {
            id: null,
            prefix: DEFAULT_PREFIX,
            lang: DEFAULT_LANG,
            commands: 1,
            banned: null
        },
        servers: {
            id: null,
            lang: DEFAULT_LANG,
            globalchat: null,
            partner: null,
            banned: null
        }
    }
    let db: Prisma = {
        $connect: prisma.$connect,
        $disconnect: prisma.$disconnect,
        users: {},
        servers: {},
        commands: {},
        globalchat: {},
        blacklist: {}
    }
    prisma.$connect()
        .then(() => {
            console.log('DATABASE', '√ Banco de dados operante', 32)
            Object.keys(prisma).filter(key => !key.startsWith("_") && !key.startsWith('$')).forEach(key => {
                db[key] = { ...prisma[key] };
                db[key].find = async (queryData: any, createIfNull: boolean = false) => {
                    typeof queryData === 'string' ? queryData = { where: { id: queryData } } : null;
                    let res = await prisma[key].findUnique(queryData);
                    return res
                        ? (template[key] ? Object.assign(template[key], res) : res)
                        : (createIfNull
                            ? await prisma[key].create(queryData.where ? { data: queryData.where } : queryData)
                            : template[key]);
                }
            })
        })
        .catch((error: Error) => console.log('DATABASE', `x Não foi possível realizar conexão ao banco de dados: ${error}`, 41))
    return db;
}