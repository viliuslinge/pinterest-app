import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import Root from './containers/Root/Root';

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();