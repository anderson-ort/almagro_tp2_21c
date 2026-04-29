import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const EXTERNAL_API = 'https://zenquotes.io/api/random';
const DATA_PATH = path.resolve('./data/quotes.json');

const readQuotesFile = async () => {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const writeQuotesFile = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
};

export const getRandomQuote = async () => {
  try {
    const response = await fetch(EXTERNAL_API);
    
    if (!response.ok) {
      throw new Error('Service unavailable');
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Service unavailable');
    }
    
    return {
      quote: data[0].q,
      author: data[0].a
    };
  } catch (error) {
    throw new Error('Service unavailable');
  }
};

export const getQuoteServiceError = () => {
  return { quote: 'Error', author: 'Service unavailable' };
};

export const getFavorites = async (userId) => {
  const quotes = await readQuotesFile();
  return quotes[userId] || [];
};

export const addFavorite = async (userId, quote, author) => {
  const quotes = await readQuotesFile();
  
  if (!quotes[userId]) {
    quotes[userId] = [];
  }
  
  const newFavorite = {
    id: Date.now(),
    quote,
    author,
    createdAt: new Date().toISOString()
  };
  
  quotes[userId].push(newFavorite);
  await writeQuotesFile(quotes);
  
  return newFavorite;
};

export const deleteFavorite = async (userId, favoriteId) => {
  const quotes = await readQuotesFile();
  
  if (!quotes[userId]) {
    return null;
  }
  
  const index = quotes[userId].findIndex(f => f.id === favoriteId);
  
  if (index === -1) {
    return null;
  }
  
  quotes[userId].splice(index, 1);
  await writeQuotesFile(quotes);
  
  return true;
};