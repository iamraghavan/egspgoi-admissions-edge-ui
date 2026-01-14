
'use client';

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: 'https://ep72fzfgjbbplg57ihinjgmeta.appsync-api.ap-south-1.amazonaws.com/graphql',
      region: 'ap-south-1',
      defaultAuthMode: 'apiKey',
      apiKey: 'da2-32lgyafdnrcizfqrbtdegftfei' 
    }
  }
});

export const amplifyClient = generateClient();
