import express from 'express';

import cookieParser from 'cookie-parser';
import logger from 'morgan';

import indexRouter from './routes/index';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

app.use((err, req, res, next) => {
  if (err.isBoom) {
    return res.status(err.output.statusCode).send(err.output.payload);
  }
  res.status(500).json({ statusCode: 500 });
});

export default app;
