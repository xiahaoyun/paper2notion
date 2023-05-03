
import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';

const Settings: React.FC = () => {
  const [notionApiToken, setNotionApiToken] = useState('');
  const [notionUrl, setNotionUrl] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(['notionApiToken','notionUrl'], (data) => {
      if (data.notionApiToken) {
        setNotionApiToken(data.notionApiToken);
      }
      if (data.notionUrl) {
        setNotionUrl(data.notionUrl);
      }
    });
  }, []);

  const saveSettings = () => {
    try {
      const databaseId = extractDatabaseIdFromNotionUrl(notionUrl);
      if(databaseId == '') {
        console.log('Invalid database URL', notionApiToken, databaseId, notionUrl);
        alert('Invalid database URL');
        return;
      }
      console.log('Saving settings', notionApiToken, databaseId, notionUrl);
      chrome.storage.sync.set({
        notionApiToken,
        databaseId,
        notionUrl
      }, () => {
        alert('Settings saved');
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  function extractDatabaseIdFromNotionUrl(url: string): string | null {
    const urlPattern = /https:\/\/www\.notion\.so\/[^/]+\/([a-zA-Z0-9]+)(\?v=[a-zA-Z0-9]+)?/;
    const match = url.match(urlPattern);
    console.log('match', match);
    console.log('url', url);
    if (match && match.length >= 2) {
      return match[1];
    }
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    saveSettings();
  };
  return (
    <div className="flex flex-col justify-center items-center bg-white  py-2 px-2 mx-2 my-4">
      <div className="flex justify-between w-full ">
        <BackButton />
        <div></div>
      </div>
      <div className="flex justify-center w-full mb-4">
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <form className="flex flex-col w-full" onSubmit={handleSubmit}>
        <label className="mb-2">
          Notion Token:
        </label>
        <input
          className="mb-2 border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-500"
          type="text"
          value={notionApiToken}
          onChange={(e) => setNotionApiToken(e.target.value)}
        />

        <label className="mb-2">
          Database URL:
        </label>
        <input
          className="mb-2 border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-blue-500"
          type="text"
          value={notionUrl}
          onChange={(e) => setNotionUrl(e.target.value)}
        />
        <button className="mb-2 mx-auto bg-blue-500 text-white rounded-lg px-4 py-2 self-start mt-4" >Save</button>
      </form>
    </div>
  );
};

export default Settings;
