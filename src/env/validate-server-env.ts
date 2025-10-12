import { readServerEnv } from '@env'

// Validate the server environment variables at module import time. This keeps the
// runtime enforcement that previously happened in the root layout while avoiding
// the need for every caller to manually invoke the loader.
readServerEnv();
