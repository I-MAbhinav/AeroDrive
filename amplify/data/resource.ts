import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  FileRecord: a.model({
    key: a.string().required(),
    name: a.string().required(),
    size: a.integer(),
    lastModified: a.string(),
    type: a.string().required(), // 'file' or 'folder'
    folderPath: a.string().required(), // e.g. 'root' or 'root/vacation'
  }).authorization(allow => [
    allow.owner()
  ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool'
  }
});
