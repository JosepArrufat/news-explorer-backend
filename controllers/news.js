const https = require('https');
const News = require('../models/newsSchema');
const {
  BAD_REQUEST,
  NOT_FOUND,
  SUCCES,
  CONFLICT_ERROR,
  CREATED_SUCCES,
  FORBIDDEN,
} = require('../utils/errorHandlers');
const ErrorHandler = require('../utils/errorClass');

const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const NEWS_API_USER_AGENT = 'news-explorer-backend/1.0';

const fetchNews = (keyword, from, to) => new Promise((resolve, reject) => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    reject(new ErrorHandler('News API key is not configured', BAD_REQUEST));
    return;
  }

  const requestUrl = new URL(`${NEWS_API_BASE_URL}/everything`);
  requestUrl.searchParams.set('q', keyword);
  requestUrl.searchParams.set('pageSize', '100');
  requestUrl.searchParams.set('from', from);
  requestUrl.searchParams.set('to', to);
  requestUrl.searchParams.set('apiKey', apiKey);

  https.get(requestUrl, {
    headers: {
      'User-Agent': NEWS_API_USER_AGENT,
      Accept: 'application/json',
    },
  }, (response) => {
    let rawData = '';

    response.on('data', (chunk) => {
      rawData += chunk;
    });

    response.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(parsedData);
        } else {
          reject(new ErrorHandler(parsedData.message || 'News request failed', response.statusCode || 500));
        }
      } catch (error) {
        reject(new ErrorHandler('Unable to parse news response', 500));
      }
    });
  }).on('error', (error) => {
    reject(error);
  });
});

const searchNews = (req, res, next) => {
  const { q, from, to } = req.query;

  if (!q || !from || !to) {
    return next(new ErrorHandler('Query parameters q, from, and to are required', BAD_REQUEST));
  }

  return fetchNews(q, from, to)
    .then((data) => res.status(SUCCES).send(data))
    .catch(next);
};

const getUserSavedNews = (req, res, next) => {
  News.find({ owner: req.user._id })
    .then((articles) => {
      res.status(SUCCES).send({ data: articles });
    })
    .catch(next);
};

const addNews = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  News.findOne({ $and: [{ link: link }, { owner: req.user._id }] })
    .then((card) => {
      if (card) {
        throw new ErrorHandler('Article already added', CONFLICT_ERROR);
      } else {
        News.create({
          keyword,
          title,
          text,
          date,
          source,
          link,
          image,
          owner: req.user._id,
        })
          .then((article) => res.status(CREATED_SUCCES).send({ data: article }))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              return next(
                new ErrorHandler(
                  'Wrong information format was entered',
                  BAD_REQUEST,
                ),
              );
            }
            if (err.name === 'Reqested resource not found') {
              return next(
                new ErrorHandler('Unable to acces the news', NOT_FOUND),
              );
            }
            return next(err);
          });
      }
    })
    .catch((err) => res.status(500).send(err.message));
};

const deleteNews = (req, res, next) => {
  const id = req.params.articleId;
  News.deleteNews(id)
    .orFail(() => {
      throw new ErrorHandler('No card found for the specified id', NOT_FOUND);
    })
    .then((article) => {
      if (article.owner !== req.user._id) {
        throw new ErrorHandler('Not allowed to delete this article', FORBIDDEN);
      }
      News.findByIdAndDelete(article._id)
        .then((articleDeleted) => {
          res.status(SUCCES).send({ data: articleDeleted });
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            return next(new ErrorHandler('Invalid articleId', BAD_REQUEST));
          }
          return next(err);
        });
    })
    .catch((err) => {
      res.status(500).send(err.message);
    });
};

module.exports = {
  searchNews,
  getUserSavedNews,
  deleteNews,
  addNews,
};
