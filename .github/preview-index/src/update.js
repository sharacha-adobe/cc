/* ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2023 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 ************************************************************************* */

const fetch = require('node-fetch-commonjs');
const msal = require('@azure/msal-node');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

require('dotenv').config();

const SP_CLIENT_ID = process.env.SP_CLIENT_ID;
const SP_TENANT_ID = process.env.SP_TENANT_ID;
const SP_CLIENT_SECRET = process.env.SP_CLIENT_SECRET;
const SP_DRIVE_ID = process.env.SP_DRIVE_ID;
const EDS_ADMIN_KEY = process.env.EDS_ADMIN_KEY;
const EDS_ACCESS_KEY = process.env.EDS_ACCESS_KEY;
const CONSUMER = process.env.CONSUMER;
const PREVIEW_INDEX_FILE = process.env.PREVIEW_INDEX_FILE;
const PREVIEW_RESOURCES_FOLDER = process.env.PREVIEW_RESOURCES_FOLDER; 

const PREVIEW_STATUS_URL = `https://admin.hlx.page/status/adobecom/${CONSUMER}/main/*`;
const PREVIEW_BASE_URL = `https://main--${CONSUMER}--adobecom.hlx.page`;
const GRAPH_BASE_URL = `https://graph.microsoft.com/v1.0`;
const SHEET_RAW_INDEX = 'raw_index';
const TABLE_NAME = 'Table1';
const FETCH_RETRY = 10;
let accessToken;

const decodeToObject = (base64String) => {
  try {
      return JSON.parse(Buffer.from(base64String, 'base64').toString());
  } catch (err) {
      return {};
  }
};

const isTokenExpired = (token) => {
  const tokenParts = token.split('.');
  if (tokenParts.length === 3) {
      const data = decodeToObject(tokenParts[1]);
      if (data && data.exp) {
          return Math.floor(Date.now() / 1000) > data.exp - 10;
      }
  }
  return true;
};

const getAccessToken = async () => {
  if (!accessToken || isTokenExpired(accessToken)) {
    console.log('fetching access token...')
    const authConfig = {
      auth: {
          clientId: SP_CLIENT_ID,
          authority: `https://login.microsoftonline.com/${SP_TENANT_ID}`,
          clientSecret: encodeURIComponent(SP_CLIENT_SECRET)
      }
    }
    const authClient = new msal.ConfidentialClientApplication(authConfig);
    const request = {
        scopes: ['https://graph.microsoft.com/.default']
    };
    const tokens = await authClient.acquireTokenByClientCredential(request);
    accessToken = tokens.accessToken;
    console.log('token fetched.');
  }
  return accessToken;
}

const getResourceIndexData = async (resource) => {
  let headers = {
    Authorization: `token ${EDS_ACCESS_KEY}`,
    'Content-Type': 'application/json'
  };
  const url = `${PREVIEW_BASE_URL}${resource.path}`;
  const response = await fetch(url, {headers});
  if (response?.status !== 200) {
    console.log('Failed to fetch card: ' + url);
    return;
  }
  const cardHTML = await response.text();
  const document = new JSDOM(cardHTML).window.document;
  const merchCard = document.querySelector('main div.merch-card');
  if (!merchCard) {
    console.log('Merch card not found in the dom: ' + merchCard.outerHTML);
    return;
  }
  const path = resource.path,
        title = document.querySelector('head > meta[property="og:title"]')?.content || '',
        cardContent = merchCard.outerHTML,
        lastModified = new Date(resource.previewLastModified).getTime().toString(),
        cardClasses = JSON.stringify(Object.values(merchCard.classList)),
        robots = 'new',
        tags = '[]',
        publicationDate = '';

  return [
    path,
    title,
    cardContent,
    lastModified,
    cardClasses,
    robots,
    tags,
    publicationDate
  ]
}

const defaultHeaders = async () => ({
  Authorization: `Bearer ${await getAccessToken()}`,
  'User-Agent': 'NONISV|Adobe|PreviewIndex/0.0.1',
});

const getItemId = async (indexPath) => {
  const url = `${GRAPH_BASE_URL}/drives/${SP_DRIVE_ID}/root:/${indexPath}`;
  console.log(`Get item id: ${url}`);
  const response = await fetch(url, {
      headers: await defaultHeaders(),
  });
  if (response) {
      console.log(`Check if document exists: ${response.status} - ${response.statusText}`);
      if (response.status === 200) {
          const jsonResponse = await response.json();
          return jsonResponse.id;
      }
  }
  return null;
};

const getPreviewResources = async (folder, parseIndexFc) => {
  const data = {"select": ["preview"], "paths": [folder]};
  let headers = {
    Authorization: `token ${EDS_ADMIN_KEY}`,
    'Content-Type': 'application/json'
  };
  const response = await fetch(PREVIEW_STATUS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response?.ok) {
    console.log(`fetching preview status failed: ${response.status} - ${response.statusText}`);
    return;
  }
  const job = await response.json();
  let jobDetailsURL = `${job.links.self}/details`;
  jobDetailsURL = 'https://admin.hlx.page/job/adobecom/cc/main/status/job-2024-07-29t17-33-30-392z/details';

  const retryFetch = async (resolve, attempt = 1) => {
    const response = await fetch(jobDetailsURL, {
      headers
    });
    const data = await response.json();
    if (data?.state === 'stopped') {
        resolve(data?.data);
    } else if (attempt < FETCH_RETRY) {
        console.log(`Attempt ${attempt}: Job state is '${data?.state}'. Checking again in 1 second...`);
        setTimeout(() => retryFetch(resolve, attempt + 1), 5000); // Wait 1 second before the next check
    } else {
        console.log("Maximum attempts reached. Stopping the fetching.");
        resolve(undefined);
    }
  };

  const cardsDataPromise = new Promise (async (resolve) => retryFetch(resolve, 1));
  const cardsData = await cardsDataPromise;
  if (!cardsData) {
    console.log('Failed to fetch previewed cards.')
    return;
  }
  
  const jsonPromises = await Promise.allSettled(
    cardsData.resources
      .filter((res) => !res.path.endsWith('.json'))
      .map(async (resource) => await parseIndexFc(resource))
  );

  const indexData = jsonPromises
    .filter((p) => p.status === 'fulfilled')
    .map((p) => p.value)
    .filter((value) => !!value);
  console.log(`fetched ${indexData?.length} previewed resources`);
  return indexData;
}

const getTableURL = (itemId) => `${GRAPH_BASE_URL}/drives/${SP_DRIVE_ID}/items/${itemId}/workbook/worksheets/${SHEET_RAW_INDEX}/tables/${TABLE_NAME}`;

const deleteAllRows = async (url) => {
  let headers = {...await defaultHeaders(),
    'Content-Type': 'application/json'
  };
  const response = await fetch(`${url}/DataBodyRange/delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      "shift": "Up"
    }),
  });
  if (response?.ok) {
    console.log(`Deleted all row: ${response.status} - ${response.statusText}`);
  } else {
    console.log(`(no rows found?) Failed to delete all rows: ${response.status} - ${response.statusText}`);
  }
}

const validateConfig = () => {
  const config = {
    SP_CLIENT_ID: SP_CLIENT_ID,
    SP_TENANT_ID: SP_TENANT_ID,
    SP_CLIENT_SECRET: SP_CLIENT_SECRET,
    SP_DRIVE_ID: SP_DRIVE_ID,
    EDS_ADMIN_KEY: EDS_ADMIN_KEY,
    EDS_ACCESS_KEY: EDS_ACCESS_KEY,
    CONSUMER: CONSUMER,
    PREVIEW_INDEX_FILE: PREVIEW_INDEX_FILE,
    PREVIEW_RESOURCES_FOLDER: PREVIEW_RESOURCES_FOLDER,
  };
  let valid = true;
  Object.entries(config).forEach(([key, value]) => {
     if (!value) {
      console.error(`ERROR: Config item ${key} is empty.`);
      valid = false;
     }
    });
  if (valid) {
    console.log('config is valid')
  }
  return valid;
}

const reindex = async (indexPath, folder) => {
  if (!validateConfig()) {
    return;
  }

  const indexData = await getPreviewResources(folder, getResourceIndexData);
  // todo think if we want to delete rows in index table in case no cards found..
  if (!indexData?.length) {
    console.log('No index data found.');
    return;
  }
  const itemId = await getItemId(indexPath);
  if (!itemId) {
    console.error('No index item id found.');
    return;
  }
  
  const tableURL = getTableURL(itemId);
  await deleteAllRows(tableURL);
  const response = await fetch(`${tableURL}/rows`, {
      method: 'POST',
      headers: await defaultHeaders(),
      body: JSON.stringify({
        "index": null, 
        "values": indexData
      }),
    });
  if (response?.ok) {
    console.log(`Added index rows: ${response.status} - ${response.statusText}`);
  } else {
    console.log(`Failed to add index rows: ${response.status} - ${response.statusText}`);
  }
  console.log(`Reindexed folder ${folder}`);
};

reindex(PREVIEW_INDEX_FILE, PREVIEW_RESOURCES_FOLDER);
