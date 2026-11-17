import { GLOBAL_SEARCH_HYMNBOOKS, HYMNBOOKS } from './constants'

const GLOBAL_SEARCH_HYMNBOOKS_KEY = 'globalSearchHymnbooks'
const GLOBAL_SEARCH_HYMNBOOKS_EVENT = 'globalSearchHymnbooksChanged'

const getGlobalSearchHymnbooks = () => {
  try {
    const storedHymnbooks = JSON.parse(localStorage.getItem(GLOBAL_SEARCH_HYMNBOOKS_KEY) || 'null')

    if (!Array.isArray(storedHymnbooks)) return GLOBAL_SEARCH_HYMNBOOKS

    return storedHymnbooks.filter(
      (book): book is string => typeof book === 'string' && HYMNBOOKS.includes(book)
    )
  } catch {
    return GLOBAL_SEARCH_HYMNBOOKS
  }
}

const setGlobalSearchHymnbooks = (hymnbooks: string[]) => {
  localStorage.setItem(GLOBAL_SEARCH_HYMNBOOKS_KEY, JSON.stringify(hymnbooks))
}

// ? Removing the override lets future defaults apply
const resetGlobalSearchHymnbooks = () => {
  localStorage.removeItem(GLOBAL_SEARCH_HYMNBOOKS_KEY)
  // ? Same-tab writes need a custom event because storage events fire in other tabs
  window.dispatchEvent(new Event(GLOBAL_SEARCH_HYMNBOOKS_EVENT))
}

export {
  GLOBAL_SEARCH_HYMNBOOKS_EVENT,
  getGlobalSearchHymnbooks,
  resetGlobalSearchHymnbooks,
  setGlobalSearchHymnbooks,
}
