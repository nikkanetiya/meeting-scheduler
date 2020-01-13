const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');

const app = express();
app.use(cors());
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

module.exports = app;
