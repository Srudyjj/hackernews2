import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

//Components

function Search(props) {
  const { value, onChange, onSubmit, children } = props;
  return (
    <form onSubmit={onSubmit}>
      {children}
      <input
        type="text"
        value={value}
        onChange={onChange}
      />
      <button type="submit">
        {children}
      </button>
    </form>
  );
}

function Table(props) {
  const { list, onDismiss } = props;

  return (
    <div className="table" >
      {list.map(item => {
        return <div key={item.objectID} className="table-row">
          <span style={{ width: '40%' }}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={{ width: '30%' }}>
            {item.author}
          </span>
          <span style={{ width: '10%' }}>
            {item.num_comments}
          </span>
          <span style={{ width: '10%' }}>
            {item.points}
          </span>
          <span style={{ width: '10%' }} >
            <Button onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Отбросить
            </Button>
          </span>
        </div>;
      })}
    </div>
  )
}

function Button(props) {
  const { onClick, className = '', children } = props;
  return (
    <button
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  )
}

//Main component

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
    };
  }

  setSearchTopStories = (result) => {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ]
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      }
    });
  }

  onDismiss = (id) => {
    const updatedList = this.state.result.hits.filter(item => item.objectID !== id);

    this.setState(
      {
        result: { ...this.state.result, hits: updatedList }
      })
  }

  onSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value })
  }

  onSearchSubmit = (e) => {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm })
    this.fetchSearchTopStories(searchTerm);
    e.preventDefault();
  }

  fetchSearchTopStories = (searchItem, page = 0) => {
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchItem}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;
    fetch(url)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(err => err);
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    const { searchTerm, results, searchKey } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (
      results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interaction">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >Поиск:{" "}
          </Search>
        </div>

        <Table
          list={list}
          onDismiss={this.onDismiss}
        />

        <div className="interaction">
          <Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)} >
            Больше историй
          </Button>
        </div>

      </div>
    );
  }
}

export default App;
