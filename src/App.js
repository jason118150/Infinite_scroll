import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components'


const AppWrapper = styled.div`
  box-sizing: border-box;
  .App-header {
    margin-top: 20px;
    margin-left: 20px;
    font-size: 80px;
  }
  .card-wrapper {
    width: 80%;
    margin: 30px auto;
    border: 4px solid black;
    box-shadow: 1px;
    border-radius: 8px;
    padding: 30px 40px;
    span {
      font-size: 24px;
      line-height: 40px;
    }
  }
`
//一次查找幾筆資料
const PAGE_NUMS = 3;

const App = () => {
  //需要顯示的資料
  const [repoData, setRepoData] = useState([]);
  //是否還有Repo
  const [isNoMoreRepo, setIsNoMoreRepo] = useState();
  const [observer, setObserver] = useState(null);
  //最底下的DOM
  const bottomRef = useRef(null);
  //目前查找API的頁數
  const pageRef = useRef(1);

  const fetchRepoData = () => {
    fetch(`https://api.github.com/users/jason118150/repos?per_page=${PAGE_NUMS}&page=${pageRef.current}`)
    .then(response => response.json())
    .then(data => {
      if(data.length) { 
        const tmpRepoData = data.map(el => ({
          title: el.name,
          description: el.description,
          url: el.html_url,
        }))
        pageRef.current++;
        setRepoData([...repoData, ...tmpRepoData]);
      } else {
        observer && observer.disconnect();
        setIsNoMoreRepo(true);
      }
    }).catch(error => {
      console.log(`Fail to fetch Github API, error message: ${error}`)
    });
  }

  const intiateScrollObserver = () => {
    observer && observer.disconnect();
    const callback = ([entry]) => {
      if (entry.isIntersecting && !isNoMoreRepo) {
        fetchRepoData();
      }
    }
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    };
    const newObserver = new IntersectionObserver(callback, options)
    if (bottomRef.current) {
      newObserver.observe(bottomRef.current);
    }
    setObserver(newObserver)   
  }
  useEffect(() => {
    fetchRepoData();
  }, [])

  useEffect(() => {
    if(!isNoMoreRepo) intiateScrollObserver();
    return () => {
      observer && observer.unobserve(bottomRef.current);
    }
  }, [repoData, isNoMoreRepo])

  return (
    <AppWrapper>
      <header className="App-header">
        My github repo
      </header>
      <section> 
        {
          repoData.map((data, index) => {
              let ref = index === repoData.length-1 ? bottomRef : null;
              return (
                <div key={index} className="card-wrapper" ref={ref}>
                  <span className="card-title">Title: {data.title || 'No Title'}</span><br />
                  <span className="card-description">Description: {data.description || 'No Description'}</span><br />
                  <span className="card-url">Url: {data.url || 'No Url'}</span>
                </div>
              )
            }
          )
        }
      </section>
    </AppWrapper>
  );
}

export default App;
