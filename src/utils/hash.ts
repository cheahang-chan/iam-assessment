import crypto from 'crypto';

/**
 * Generates a SHA256 hash of a group object for change detection.
 * - Used to detect changes in group data for synchronization logic.
 * - Uses SHA256 for strong collision resistance.
 * 
 * Caveat: Only sorts top-level keys. If the object contains nested objects,
 * differences in nested key order may still result in different hashes.
 */
export const generateGroupHash = (group: object): string => {
    const json = JSON.stringify(group, Object.keys(group).sort());
    return crypto.createHash('sha256').update(json).digest('hex');
};
