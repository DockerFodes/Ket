interface table {
    create?(data: object);
    update?(data: object);
    find?(data: string | object, boolean?);
    delete?(data: object);

    findMany?(options?: object)
    findUnique?(options: object)
}

interface Prisma {
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
    ready: boolean;
    users: table;
    servers: table,
    commands: table;
    globalchat: table
    blacklist: table;
}