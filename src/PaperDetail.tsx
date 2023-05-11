import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SettingsButton from "./SettingsButton";
import BackButton from "./BackButton";
import Modal from "react-modal";

interface Author {
  authorId: string;
  name: string;
}

interface Tldr {
  model: string;
  text: string;
}

interface OpenAccessPdf {
  url: string;
  status: string;
}
interface PaperDetails {
  paperId: string;
  publicationVenue: string;
  url: string;
  title: string;
  abstract: string;
  venue: string;
  year: number;
  citationCount: number;
  tldr?: Tldr;
  authors: Author[];
  openAccessPdf?: OpenAccessPdf;
  externalIds?: Record<string, string>;
  pdfUrl?: string | null;
}

Modal.setAppElement("#root");

const PaperDetail: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const [paperDetails, setPaperDetails] = useState<PaperDetails | null>(null);
  const [notionApiToken, setNotionApiToken] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [responseUrl, setResponseUrl] = useState("");


  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        const response = await axios.get<PaperDetails>(
          `https://api.semanticscholar.org/graph/v1/paper/${paperId}`,
          {
            params: {
              fields:
                "url,title,venue,publicationVenue,year,authors,abstract,citationCount,tldr,openAccessPdf,externalIds",
            },
          }
        );
        console.log("Paper details:", response.data);
        setPaperDetails({ ...response.data, pdfUrl: get_pdf_url(response.data) });
      } catch (error) {
        console.error("Error fetching paper details:", error);
      }

      chrome.storage.sync.get(['notionApiToken', 'databaseId'], (data) => {
        if (data.notionApiToken) {
          setNotionApiToken(data.notionApiToken);
        }
        if (data.databaseId) {
          setDatabaseId(data.databaseId);
        }
      });

    };

    fetchPaperDetails();
  }, [paperId]);

  const closeModal = () => {
    setModalIsOpen(false);
  };

  function get_pdf_url(paper_details: PaperDetails): string | null {
    if (paper_details.openAccessPdf) {
      return paper_details.openAccessPdf.url;
    }
    if (!paper_details.externalIds) {
      return null;
    }
    const external_ids = paper_details.externalIds;
    if ("ACL" in external_ids) {
      return `https://aclanthology.org/${external_ids.ACL}.pdf`;
    }
    if ("ArXiv" in external_ids) {
      return `https://arxiv.org/pdf/${external_ids.ArXiv}.pdf`;
    }
    if ("DOI" in external_ids) {
      const DOI_id = external_ids.DOI;
      return `https://doi.org/${DOI_id}`;
    }
    return null;
  }


  const saveToNotion = async () => {
    if (!paperDetails) {
      alert("No paper details to save.");
      return;
    }

    if (!notionApiToken || !databaseId) {
      alert("Please set your Notion API token and Database ID in the settings.");
      return;
    }

    const authorsAsTags = paperDetails.authors.map((author) => ({
      name: author.name,
    }));

    const venueAsSelect = paperDetails.venue? {select:{ name: paperDetails.venue }}: null ;

    try {
      const response = await axios.post("https://api.notion.com/v1/pages", {
        parent: { database_id: databaseId },
        properties: {
          title: { title: [{ text: { content: paperDetails.title } }] },
          authors: {
            multi_select: authorsAsTags.map((author) => ({ name: author.name })),
          },
          year: { number: paperDetails.year },
          url: { url: paperDetails.url },
          abstract: { rich_text: [{ text: { content: paperDetails.abstract } }] },
          ...(venueAsSelect && { venue: venueAsSelect }),
          citationCount: { number: paperDetails.citationCount },
          tldr: { rich_text: [{ text: { content: paperDetails.tldr ? paperDetails.tldr.text : "" } }] },
          pdf: { url: paperDetails.pdfUrl ?? "" },
        },
      },
        {
          headers: {
            "Notion-Version": "2022-06-28",
            "Authorization": `Bearer ${notionApiToken}`
          },
        });

      setResponseUrl(response.data.url);
      setModalIsOpen(true);
    } catch (error) {
      console.error("Error saving paper to Notion:", error);
      alert("Failed to save paper to Notion.");
    }
  };




  if (!paperDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between mb-2">
        <BackButton />
        <SettingsButton />
      </div>
      <button
        onClick={saveToNotion}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
      >
        Save to Notion
      </button>
      <h1 className="text-xl font-bold mb-4 text-blue-900">{paperDetails.title}</h1>
      <p className="mb-2 text-gray-800">
        <strong className="font-semibold">Authors:</strong>{" "}
        {paperDetails.authors.map((author) => author.name).join(", ")}
      </p>
      <p className="mb-2 text-gray-800">
        <strong className="font-semibold">PDF:</strong>{" "}
        {paperDetails.pdfUrl ? (
          <a
            href={paperDetails.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            {paperDetails.pdfUrl}
          </a>
        ) : (
          "None"
        )}
      </p>
      <p className="mb-2 text-gray-800">
        <strong className="font-semibold">URL:</strong>{" "}
        <a
          href={paperDetails.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          {paperDetails.url}
        </a>
      </p>
      <p className="mb-2 text-gray-800">
        <strong className="font-semibold">Year:</strong> {paperDetails.year}
      </p>
      <p className="mb-2 text-gray-800">
        <strong className="font-semibold">Venue:</strong> {paperDetails.venue}
      </p>
      <p className="mb-2 text-gray-800">
        <strong className="font-semibold">Citation Count:</strong>{" "}
        {paperDetails.citationCount}
      </p>
      <p className="mb-2 text-gray-800">
        <strong className="font-semibold">TL;DR:</strong>  {paperDetails.tldr?(paperDetails.tldr.text):("None")}
      </p>
      <p className="text-gray-800">
        <strong className="font-semibold">Abstract:</strong>{" "}
        <span className="block mt-2">{paperDetails.abstract}</span>
      </p>


      
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Save to Notion Success"
        className="bg-white w-11/12 md:max-w-md mx-auto rounded p-5 mt-20 border"
        overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-75"
      >
        <h2 className="text-2xl font-bold mb-2">Paper saved to Notion</h2>
        <p className="mb-2">You can access the saved paper by clicking the button below:</p>
        <button
          onClick={() => window.open(responseUrl, "_blank")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Open Saved Paper
        </button>
        <button
          onClick={closeModal}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </Modal>
    </div>

  );
};

export default PaperDetail;
