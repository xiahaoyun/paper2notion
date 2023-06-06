import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SettingsButton from "./SettingsButton";
import BackButton from "./BackButton";

interface Paper {
  paperId: string;
  title: string;
}

interface SearchResponse {
  total: number;
  offset: number;
  next: number;
  data: Paper[];
}

const PaperSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 5;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const searchPapers = async (searchQuery: string, searchOffset: number) => {
    setPapers([]);
    setLoading(true);
    try {
      const response = await axios.get<SearchResponse>(
        "https://api.semanticscholar.org/graph/v1/paper/search",
        {
          params: {
            query: searchQuery,
            offset: searchOffset,
            limit: limit,
          },
        }
      );
      
      setPapers(response.data.data??[]);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data:"+error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    searchPapers(query, 0);
    setOffset(0);
  };

  const handleNextPage = () => {
    const newOffset = offset + limit;
    searchPapers(query, newOffset);
    setOffset(newOffset);
  };
  const handlePrevPageClick = () => {
    if (offset >= limit) {
      const newOffset = offset - limit;
      searchPapers(query, newOffset);
      setOffset(newOffset);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePaperClick = (paperId: string) => {
    console.log("Clicked paper with id:", paperId);
    navigate(`/paper/${paperId}`);

  };
  const currentPage = offset / limit + 1;

  return (
    <div className="flex flex-col items-center w-full mx-auto max-w-screen-md py-2">
      <div className="flex justify-between w-full mb-4">
        <BackButton />
        <SettingsButton />
      </div>
      <h1 className="text-2xl font-bold mb-4">Paper2Notion</h1>
      <div className="mb-4 w-full max-w-lg">
        <input className="w-3/4 border border-gray-400 rounded-lg py-2 px-4 focus:outline-none focus:border-blue-500"
          type="text"
          value={query}
          placeholder="Input a paper title or keywords"
          onKeyDown={handleKeyPress}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <button className="bg-blue-500 text-white rounded-lg px-4 py-2 mb-4" onClick={handleSearch}>Search</button>
      
      {loading && (
        <div className="flex justify-center items-center w-full h-64">
          <div className="animate-spin h-5 w-5 border-t-4 border-blue-500 rounded-full"></div>
        </div>
      )}
      {
        !loading && papers.length === 0 && (
          <div className="w-full text-center">
            <p>No results found</p>
          </div>
        )
      }

      {papers.length > 0 && (
        <div className="w-full">
          <ul className="list-none p-0 mb-4">
            {papers.map((paper) => (
              <li
                key={paper.paperId}
                onClick={() => handlePaperClick(paper.paperId)}
                className="cursor-pointer border-b border-gray-300 py-2 px-4 hover:bg-gray-200 transition-all duration-200 ease-out"
              >
                {paper.title}
              </li>
            ))}
          </ul>
          <div className="flex justify-between">
            <button className="bg-blue-500 text-white rounded-lg px-2 py-1" onClick={handlePrevPageClick} disabled={currentPage === 1}>
              &lt; Prev
            </button>
            {total > 0 && (
        <div className="px-2 text-center">
          <p>Current Page: {currentPage}</p>
          <p>Papers Counts: {total}</p>
        </div>
      )}
            <button className="bg-blue-500 text-white rounded-lg px-2 py-1" onClick={handleNextPage} disabled={currentPage === total}>
              Next &gt;
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaperSearch;
