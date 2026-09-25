export type {
  SearchGroup,
  SearchResultItem,
  GroupedSearchResults,
} from "@/lib/mock-search-index";

export { hasAnySearchResults } from "@/lib/mock-search-index";

import {
  GroupedSearchResults,
  searchMockIndex,
} from "@/lib/mock-search-index";

export const SEARCH_DEBOUNCE_MS = 300;

export interface SearchIndexMetadata {
  totalItems: number;
  lastIndexedAt?: Date;
  version?: string;
}


export interface SearchDataProvider {
  search(query: string): Promise<GroupedSearchResults>;
  cancel?(): void;
  indexMetadata?(): Promise<SearchIndexMetadata>;
}

const mockSearchProvider: SearchDataProvider = {
  search(query: string) {
    return searchMockIndex(query);
  },
  async indexMetadata() {
    return { totalItems: 14, version: "mock-v1" };
  },
};

let activeSearchProvider: SearchDataProvider = mockSearchProvider;

export function getSearchDataProvider(): SearchDataProvider {
  return activeSearchProvider;
}

export function setSearchDataProvider(provider: SearchDataProvider): void {
  activeSearchProvider = provider;
}
