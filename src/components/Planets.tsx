import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import ReactPaginate from 'react-paginate';
import People from './People';
import Loading from './Loading';
import { ErrorBoundary } from "react-error-boundary";
interface apiResponse {
  count: number;
  next: string;
  previous: string;
  results: Array<string | number>;
}

interface IOption {
  label: string;
  value: string
}

//To create dropdown for planets we will create options from api response
const options: Array<IOption> = [];

function Planets() {
  //Number of results to show per page
  const NUM_RESULTS = 10;

  //initial state for all peoples from all planets
  const [allPeoples, setAllPeoples] = useState<Array<string>>();

  // for showing loader
  const [loader, setLoader] = useState(0);

  //state to store all people data as fallback
  const [planetPeople, setPlanetPeople] = useState<Array<string>>();


  const [make, setMake] = useState<Array<IOption> | null>(null);

  //to save current page state for pagination
  const [currentPage, setCurrentPage] = useState(1);

  //fallback when we clear search results, dont want to call api again
  const [pageCount, setPageCount] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

 //function to handle dropdown value change
  const handleChange = (e: any) => {
    if(e && e.value.indexOf('http') == -1) {
      e.value = `https://swapi.dev/api/planets/${e.value}`;
    }
    if (e) {
      getPlanetData(e.value);
    } else {
      setAllPeoples(planetPeople);
      setTotalPage(pageCount);
    }

  }

  //function for initial page load data for showing peoples
  const getData = (init: boolean, page: number) => {
    setLoader(1);
    fetch(`https://swapi.dev/api/people/?page=${page}`).then(resp => resp.json()).then((result) => {
      setAllPeoples(result.results);

      if (init) {
        setPlanetPeople(result.results);
        setTotalPage(Math.ceil(result.count / NUM_RESULTS));
        setPageCount(Math.ceil(result.count / NUM_RESULTS));
      }
      setLoader(0);
    });
  }


  useEffect(() => {
    getData(true, 1);

    //API does not provide data for all planets in one go, so sending multiple calls for creating dropdown
    Promise.all([
      fetch('https://swapi.dev/api/planets/').then(resp => resp.json()),
      fetch('https://swapi.dev/api/planets/?page=2').then(resp => resp.json()),
      fetch('https://swapi.dev/api/planets/?page=3').then(resp => resp.json()),
      fetch('https://swapi.dev/api/planets/?page=4').then(resp => resp.json()),
      fetch('https://swapi.dev/api/planets/?page=5').then(resp => resp.json()),
      fetch('https://swapi.dev/api/planets/?page=6').then(resp => resp.json()),
    ]).then((result) => {
      result.forEach((item) => {
        (item.results).forEach((node: any) => {
          options.push({ value: node.url, label: node.name });
        })
      });
      setMake(options);
    });
  }, []);

 //function to get people on the basis of planet selected
  const getPlanetData = (url: string) => {
    setLoader(1);
    fetch(url).then(response => {
      return response.json()
    }).then(
      data => {
        if (data.residents && data.residents.length) {
          getDataForResidents(data.residents);
        } else {
          setLoader(0);
          setAllPeoples([]);
          setTotalPage(0);
        }
      });
  }

  const getDataForResidents = (data: Array<string>) => {
    Promise.all(data.map((url: string) => fetch(url))).then(responses =>
      Promise.all(responses.map((res: any) => res.json()))
    ).then(texts => {
      setAllPeoples(texts);
      setTotalPage(0);
    })
    setLoader(0);
  }

  //set current page state
  const onPageChange = (page: { selected: number }) => {
    getData(false, page.selected + 1);
  };

  return (
    <>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div className="searchWrapper">{make && <CreatableSelect onChange={handleChange} options={make} isClearable placeholder={'Search for planets'} formatCreateLabel={(input) => `Search for ${input}`} />}</div>
        {!!loader && <Loading />}
        {!loader &&
          <div className="con">
            <People peoples={allPeoples} />
          </div>
        }
        {totalPage > 0 && <ReactPaginate
          previousLabel={"← Previous"}
          nextLabel={"Next →"}
          pageCount={totalPage}
          onPageChange={onPageChange}
          containerClassName={"pagination"}
          previousLinkClassName={"pagination__link"}
          nextLinkClassName={"pagination__link"}
          disabledClassName={"pagination__link--disabled"}
          activeClassName={"pagination__link--active"}
        />
        }
      </ErrorBoundary>

    </>
  );
}

export default Planets;
