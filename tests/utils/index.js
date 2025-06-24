"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJwt = exports.truncateTables = void 0;
const truncateTables = async (connection) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};
exports.truncateTables = truncateTables;
const isJwt = (token) => {
    if (!token)
        return false;
    const parts = token.split('.');
    if (parts.length !== 3)
        return false;
    try {
        const [headerB64, payloadB64] = parts;
        JSON.parse(Buffer.from(headerB64, 'base64').toString('utf-8'));
        JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'));
        return true;
    }
    catch (err) {
        if (err)
            return false;
    }
};
exports.isJwt = isJwt;
