# OpenAPI TS Validator

run `openapi-ts-validator generate -i <input file> -o <output directory>` to generate a TypeScript schema file to use for validation.

To validate an object pass the value and the schema to the function `validate` as follows:

```
import {schemas} from <output_path>;
import {validate, parseErrors} from 'openapi-ts-validator';

const errors = validate(value, schemas.Id.__schema__);
const message = parseErrors(errors);
```

This functions returns an `ErrorObject` list containing all errors if the value is invalid.
It returns `undefined` if the value in valid.

The `parseErrors` function returns the errors as a `string` if an array is passed.
Optionally it also takes a `label` of type `string` which will be prepended to the parsed error message.

The data structures must be defined inside the `schemas`, `parameters` or `requestBodies` sections to be considered during the generation.
