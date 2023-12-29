Using firebase in localhost

require('dotenv').config({ path: '.env.local' });

console.log(process.env.API_KEY); // The API key is now accessible without being hardcoded in the code.
