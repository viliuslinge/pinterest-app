const functions = require('firebase-functions');
const request = require('request-promise');

exports.indexPostsToElastic = functions.firestore
  .document('posts/{postId}')
  .onWrite((change, context) => {
    const document = change.after.exists ? change.after.data() : null;
    const postId = context.params.postId;

    console.log('Indexing post: ', document);

    const elasticSearchConfig = functions.config().elasticsearch;
    const elasticSearchUrl = elasticSearchConfig.url + 'posts/post/' + postId;
    const elasticSearchMethod = document ? 'POST' : 'DELETE';

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

exports.getRelatedPosts = functions.https.onCall((data, context) => {
  const searchTags = data;
  let queryURL = 'http://35.192.18.49//elasticsearch/posts/post/_search?q='

  for (let i = 0; i < searchTags.length; i++) {
    queryURL += `tags:*${searchTags[i]}*`
    if (i !== searchTags.length - 1) {
      queryURL += '+'
    }
  }

  const elasticSearchConfig = functions.config().elasticsearch;
  let elasticSearchRequest = {
    method: 'GET',
    url: queryURL,
    auth: {
      username: elasticSearchConfig.username,
      password: elasticSearchConfig.password
    }
  }
  return request(elasticSearchRequest)
  .then(response => {
    console.log('Response received');
    return response
  })
  .catch(err => console.log(err))
});


