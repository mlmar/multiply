import { get, post } from './HTTPService.js';

const ENDPOINTS = {
  SCORES: 'multiply/scores',
  INSERT: 'multiply/insert'
}

export const getScores = async () => {
  const response = await get(ENDPOINTS.SCORES);
  return response;
}

export const insertScore = async (data) => {
  const response = await post(ENDPOINTS.INSERT, data);
  return response;
}