import React, { Component } from 'react';
import logo from './logo.svg';
import {BrowserRouter as Router, Link} from 'react-router-dom';
import { Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

class Gist extends Component {
  constructor(props) {
    super(props);
    this.gist = this.props.gist;
    this.state = {
      fileContent: null,
      language: null,
    };
  }

  componentDidMount() {
    if (!this.gist) {
      return;
    }
    const self = this;
    const allFiles = Object.values(this.gist.files);
    allFiles.forEach((file, key) => {
      const raw_url = file.raw_url;
      fetch(raw_url)
        .then((response) => response.text())
        .then((content) => {
          self.setState({
            fileContent: content, 
            language: file.language
          });
        });
    });
  }

  render() {
    if (!this.gist) {
      return (
        <div className="alert alert-danger">
          This gist is not available anymore. <Link to="/">Go home</Link>.
        </div>
      );
    }
    return(
        <div className="gistResultContainer">
          <h1>{this.gist.id}</h1>
          <pre>Created on {this.gist.created_at}</pre>
          <pre>{this.gist.description}</pre>
          { this.state.language &&
          <SyntaxHighlighter language={this.state.language} style={docco}>{this.state.fileContent}</SyntaxHighlighter> }
          {!this.state.language && <pre>
              <code lang={this.state.language}>
              {this.state.fileContent}
              </code>
            </pre>
          }
        </div>
    );
  }

}

class GistList extends Component {
  render() {
    const gists = this.props.gists;
    const gistArray = [];
    let errorMSGBox = [];
    if (gists !== null && gists.length > 0) {
      gists.forEach((gist, key) => {
        const linkName = gist.description || gist.id;
        gistArray.push(<li className="gist-item" key={key}><Link to={`/gist/${gist.id}`}>{linkName}</Link></li>);
      });
    }
    if (gists !== undefined && Array.isArray(gists) === false) {
      console.log('I am gists', gists);
    }
    return(
      <div>
        <ul className="gistList">
          {gistArray}
          {errorMSGBox}
        </ul>
      </div>
    );
  }
}



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gistList: null,
    };
  }

  componentDidMount() {
      fetch('https://api.github.com/gists?client_id=6396a71f53863e556b11&&client_secret=098d29751f484f46307027baf674d072ae97050a`')
        .then(res => res.json())
        .then(gists => {
          this.setState({gistList: gists})
        });
  }

  render() {
    const gists = this.state.gistList;
    return (
      <Router>
        <div className="container-fluid">
          <h1> Realtime Gist Monitor <img src={logo} className="App-logo" alt="logo" height="50" width="50"/></h1>
          <div className="row">
            <div className="col-4 sidebar">
              <GistList gists={this.state.gistList} />
            </div>
            <div className="col-8 main-content">
              <Route exact path="/"  render={() => <div>Welcome</div>} />
              { gists && (
                <Route path="/gist/:gistId" render={({match})=> (
                  <Gist key={match.params.gistId} gist={gists.find(g=> g.id === match.params.gistId )} />
                )} />
              )}
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;

