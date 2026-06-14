import express from 'express';
import routes from './routes';
import { logger } from './utils/logger';

const app = express();
app.use(express.json());
app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Server started on ${port}`));
