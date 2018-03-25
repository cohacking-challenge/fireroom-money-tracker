import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {
  initializeApp as initFirebaseApp,
  firestore as initFirestore,
} from 'firebase';
import 'firebase/firestore';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
