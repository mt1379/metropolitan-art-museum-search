const API_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/'

export const buildUrl = (path: string, queryParams: Record<string, string>) => {
  const url = new URL(path, API_BASE_URL);

  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};