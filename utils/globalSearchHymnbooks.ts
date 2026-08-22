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

// Reset by removing the entry so the getter falls back to the current
// GLOBAL_SEARCH_HYMNBOOKS default — future changes to the constant then propagate
// without needing another reset. Custom event lets any mounted /books instance re-sync
// its checkbox state (same-window localStorage writes don't fire the 'storage' event).
const resetGlobalSearchHymnbooks = () => {
  localStorage.removeItem(GLOBAL_SEARCH_HYMNBOOKS_KEY)
  window.dispatchEvent(new Event(GLOBAL_SEARCH_HYMNBOOKS_EVENT))
}

export {
  GLOBAL_SEARCH_HYMNBOOKS_EVENT,
  getGlobalSearchHymnbooks,
  resetGlobalSearchHymnbooks,
  setGlobalSearchHymnbooks,
}
