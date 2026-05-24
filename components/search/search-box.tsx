import Image from 'next/image'
import { useRouter } from 'next/router'

import { DEFAULT_SETTINGS, SEARCH_PREFIXES } from '@/utils/constants'

import styles from '@/styles/pages/search.module.scss'

const unlocked = process.env.NEXT_PUBLIC_UNLOCKED === 'true'

export default function SearchBox({
  inputRef,
  setInputValue,
  inputValue,
  activePrefix,
  setActivePrefix,
  localSettings,
  resultCount,
  setRenderPage,
  handleClear,
  handleRandomHymn,
}: {
  inputRef: React.RefObject<HTMLInputElement>
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  inputValue: string
  setActivePrefix: React.Dispatch<React.SetStateAction<(typeof SEARCH_PREFIXES)[number]>>
  activePrefix: (typeof SEARCH_PREFIXES)[number]
  localSettings?: typeof DEFAULT_SETTINGS
  resultCount?: number
  setRenderPage: React.Dispatch<React.SetStateAction<number>>
  handleClear: () => void
  handleRandomHymn: () => void
}) {
  const router = useRouter()
  const currentBook = typeof router.query.book === 'string' ? router.query.book : undefined

  const hasPrefix = activePrefix === '@' || activePrefix === '#'
  const showClearBtn = !!inputValue || hasPrefix

  const getSearchBoxClassName = () => {
    if (activePrefix === '@') return styles.authorSearch
    if (activePrefix === '#') return styles.keywordSearch
    return ''
  }

  const getPrefixOverlayClassName = () => {
    if (activePrefix === '@') return styles.authorPrefix
    if (activePrefix === '#') return styles.keywordPrefix
    return ''
  }

  const getPlaceholder = () => {
    const suffix = resultCount ? `(${resultCount})` : ''

    if (activePrefix === '@') return `Wyszukaj autora ${suffix}`
    if (activePrefix === '#') return `Wyszukaj słowa kluczowe ${suffix}`
    return `Rozpocznij wyszukiwanie ${suffix}`
  }

  const handleBackspace = () => {
    if (!hasPrefix || inputValue !== '') return

    setActivePrefix(null)

    const fromStorage = localStorage.getItem('prevSearch')
    if (!fromStorage) return

    const json = JSON.parse(fromStorage)
    json.prefix = null
    localStorage.setItem('prevSearch', JSON.stringify(json))
  }

  const handleChange = (value: string) => {
    if (unlocked && !activePrefix && value === '2137') {
      localStorage.removeItem('prevSearch')
      router.push({
        pathname: '/hymn',
        query: {
          book: 'C',
          title: '7C. Pan kiedyś stanął nad brzegiem',
        },
      })
      return
    }

    const startsWithAuthor = value.startsWith('@')
    const startsWithKeyword = value.startsWith('#')

    let nextPrefix = null
    let formattedValue = value

    if (unlocked && localSettings?.contextSearch) {
      if (startsWithAuthor && !activePrefix) {
        nextPrefix = '@'
        formattedValue = value.slice(1).trim()
      } else if (startsWithKeyword && !activePrefix) {
        nextPrefix = '#'
        formattedValue = value.slice(1).trim()
      }

      if (nextPrefix) setActivePrefix(nextPrefix)
    }

    setInputValue(formattedValue)
    setRenderPage(0)

    localStorage.setItem(
      'prevSearch',
      JSON.stringify({
        book: currentBook,
        value: formattedValue,
        prefix: activePrefix || nextPrefix,
      })
    )
  }

  return (
    <div className={styles.searchBox}>
      <div className={styles.searchIcon}>
        <Image
          className='icon'
          alt='search'
          src='/icons/search.svg'
          width={25}
          height={25}
          draggable={false}
        />
      </div>

      {activePrefix && (
        <div className={`${styles.prefixOverlay} ${getPrefixOverlayClassName()}`}>
          {activePrefix}
        </div>
      )}

      <input
        ref={inputRef}
        name='search-box'
        className={getSearchBoxClassName()}
        value={inputValue}
        autoComplete='off'
        placeholder={getPlaceholder()}
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') handleBackspace()
        }}
        onChange={(e) => handleChange(e.target.value)}
      />

      {showClearBtn ? (
        <button
          title='Wyczyść wyszukiwanie [Backspace]'
          className={styles.clearButton}
          onClick={handleClear}
        >
          <Image
            className='icon'
            alt='clear'
            src='/icons/close.svg'
            width={23}
            height={23}
            draggable={false}
          />
        </button>
      ) : (
        <button
          title='Otwórz losową pieśń z wybranego śpiewnika [R]'
          className={styles.randomButton}
          onClick={handleRandomHymn}
        >
          <Image
            className='icon'
            alt='dice'
            src='/icons/dice.svg'
            width={25}
            height={25}
            draggable={false}
          />
        </button>
      )}
    </div>
  )
}
