import { z } from 'zod';

export const SecurityGroupSchema = z.object({
    id: z.string().uuid(),
    displayName: z.string().min(1),
    description: z.string().nullable().optional(),
    mailEnabled: z.boolean(),
    mailNickname: z.string().optional(),
    securityEnabled: z.boolean(),
    groupTypes: z.array(z.string()).optional(),
    visibility: z.string().nullable().optional(),
    renewedDateTime: z.string().datetime(),
    createdDateTime: z.string().datetime()
});

export type SecurityGroupDTO = z.infer<typeof SecurityGroupSchema>;
