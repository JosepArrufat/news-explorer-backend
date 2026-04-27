const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes/index');
const error = require('./middlewares/error');

require('dotenv').config();
const { NODE_ENV, MONGO_URL, ALLOWED_ORIGIN } = process.env;
const { requestLogger, errorLogger } = require('./middlewares/logger');
const rateLimiter = require('./utils/rateLimiter');

const app = express();
const { PORT = 3001 } = process.env;

mongoose.connect(NODE_ENV === 'production' ? MONGO_URL : 'mongodb://localhost:27017/news-explorer', {
  useNewUrlParser: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(requestLogger);

app.use(cors({
  origin: ALLOWED_ORIGIN || 'http://localhost:3000',
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'authorization'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
}));
app.options('*', cors());
app.use(rateLimiter);

app.use(routes);
app.use(errors());
app.use(errorLogger);
app.use('', error);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
