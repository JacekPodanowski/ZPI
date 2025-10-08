import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import WelcomePage from './components/WelcomePage/WelcomePage';
import Editor from './components/Editor/Editor';
import Studio from './components/Studio/Studio';
import HomePage from './components/Modules/HomePage/HomePage';
import AboutMe from './components/Modules/AboutMe/AboutMe';
import Calendar from './components/Modules/Calendar/Calendar';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={WelcomePage} />
        <Route path="/editor" component={Editor} />
        <Route path="/studio" component={Studio} />
        <Route path="/home" component={HomePage} />
        <Route path="/about" component={AboutMe} />
        <Route path="/calendar" component={Calendar} />
      </Switch>
    </Router>
  );
};

export default App;