import crypto from 'crypto';

export const generateGroupHash = (group: object): string => {
    const json = JSON.stringify(group, Object.keys(group).sort());
    return crypto.createHash('sha256').update(json).digest('hex');
};