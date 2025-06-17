import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import 'isomorphic-fetch';

/**
 * Creates a Microsoft Graph client using Azure Identity.
 * Automatically handles token acquisition.
 * 
 * Azure Portal to Manage Application & Secrets for the Application
 * https://portal.azure.com/?feature.msaljs=true#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
 */

export const createGraphClient = async (): Promise<Client> => {
    // https://learn.microsoft.com/en-us/graph/sdks/create-client?tabs=typescript
    // https://learn.microsoft.com/en-us/graph/sdks/choose-authentication-providers?tabs=typescript#using-a-clients-secret
    
    const credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID!,
        process.env.AZURE_CLIENT_ID!,
        process.env.AZURE_CLIENT_SECRET!
    );

    // @microsoft/microsoft-graph-client/authProviders/azureTokenCredentials
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default'],
    });

    return Client.initWithMiddleware({ authProvider: authProvider });
};
