"use strict";
import React from "react";
import {render} from "react-dom";
import { Router, Route, browserHistory, IndexRoute} from 'react-router';
import '../node_modules/normalize.css/normalize.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css'

import App from "./App";
import BookList from "./BookList";
import Book from "./Book";
import BookChapters from "./BookChapters";

render((
	<Router history={browserHistory}>
		<Route path="/" component={App}></Route>
	  <Route path="/book" component={BookList}></Route>
		<Route path="/book/:id" component={BookChapters}></Route>
    <Route path="/book/:id/:num" component={Book}></Route>
  </Router>
),document.getElementById('main'));



