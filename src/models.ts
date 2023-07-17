export interface JsonContent {
  $ref?: string;
  properties?: JsonContent;
  items?: JsonContent;
  type?: 'object' | 'array' | string;
  allOf?: JsonContent[];
  oneOf?: JsonContent[];
  anyOf?: JsonContent[];
  [key: string]: any;
}

export interface Property {
  name: string;
  schema: JsonContent;
}

export type FileType = 'json' | 'yaml';
