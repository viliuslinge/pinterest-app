const functions = require('firebase-functions');
const request = require('request-promise');

exports.indexPostsToElastic = functions.firestore
  .document('posts/{postId}')
  .onWrite((change, context) => {
    let document = change.after.exists ? change.after.data() : null;
    let postId = context.params.postId;

    console.log('Indexing post: ', document);

    let elasticSearchConfig = functions.config().elasticsearch;
    let elasticSearchUrl = elasticSearchConfig.url + 'posts/post/' + postId;
    let elasticSearchMethod = document ? 'POST' : 'DELETE';

    let elasticSearchRequest = {
      method: elasticSearchMethod,
      url: elasticSearchUrl,
      auth: {
        username: elasticSearchConfig.username,
        password: elasticSearchConfig.password
      },
      body: document,
      json: true
    }
    if (document && document.status === 'draft') {
      return null;
    } else {
      return request(elasticSearchRequest)
      .then(response => {
        return console.log('ElasticSearch response:', response);
      })
      .catch(err => console.log(err))
    }
  });
