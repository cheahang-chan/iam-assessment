import mongoose from 'mongoose';

const SecurityGroupSchema = new mongoose.Schema({
    graphId: { type: String, unique: true },
    displayName: String,
    description: String,
    mailNickname: String,
    mailEnabled: Boolean,
    securityEnabled: Boolean,
    groupTypes: [String],
    visibility: String,
    createdDateTime: Date,
    renewedDateTime: Date,
    groupHash: { type: String, index: true },
    syncedAt: Date
});

export const SecurityGroupModel = mongoose.model('SecurityGroup', SecurityGroupSchema);
