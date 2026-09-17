import { startServer } from './server.js';

const PORT = Number(process.env.PORT ?? 3001);

startServer(PORT).then(({ port }) => {
  console.log(`cryosleep server listening on :${port}`);
});
