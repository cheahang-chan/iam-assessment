import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import axios from 'axios';
import 'isomorphic-fetch';
import { AppError } from '../utils/errors';
import { HttpStatus } from '../utils/http-status';

/**
 * Creates a Microsoft Graph client using Azure Identity.
 * Automatically handles token acquisition.
 * 
 * Azure Portal to Manage Application & Secrets for the Application
 * https://portal.azure.com/?feature.msaljs=true#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
 */

const getAzureCredentials = () => {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
        throw new Error('Missing required Azure AD credentials in environment variables.');
    }

    return { tenantId, clientId, clientSecret };
};

export const createGraphClient = async (): Promise<Client> => {
    // https://learn.microsoft.com/en-us/graph/sdks/create-client?tabs=typescript
    // https://learn.microsoft.com/en-us/graph/sdks/choose-authentication-providers?tabs=typescript#using-a-clients-secret

    const { tenantId, clientId, clientSecret } = getAzureCredentials();
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

    // @microsoft/microsoft-graph-client/authProviders/azureTokenCredentials
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default'],
    });

    return Client.initWithMiddleware({ authProvider: authProvider });
};

export const getAccessToken = async (): Promise<string> => {
    const { tenantId, clientId, clientSecret } = getAzureCredentials();

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    try {
        const response = await axios.post(tokenUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        return response.data.access_token as string;
    } catch (err: any) {
        throw new AppError(
            'Failed to fetch Microsoft Graph Access Token:',
            HttpStatus.BAD_GATEWAY,
            'GRAPH_API_ERROR',
            err);
    }
}