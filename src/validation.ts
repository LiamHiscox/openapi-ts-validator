import Ajv, {ErrorObject, Schema} from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({strict: false});
addFormats(ajv);

export function validate(
  value: unknown,
  schemaString: string
): ErrorObject[] | undefined {
  const schema: Schema = JSON.parse(schemaString);
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const result = ajv.validate(schema, value);
  if (result) {
    return undefined;
  }
  if (ajv.errors) {
    return ajv.errors;
  }
  throw new Error('Unexpected data received.');
}

export function parseErrors(errors?: ErrorObject[], label?: string): string | undefined {
  return errors
    ?.map(e => `${label ?? getInstanceName(e)} ${e.message}`)
    .join('\n');
}

function getInstanceName(error: ErrorObject) {
  return error.instancePath
    .split('/')
    .filter(i => i.trim())
    .join(' ');
}
