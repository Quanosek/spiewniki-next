import Router from 'next/router'

const shareButton = () => {
  if (navigator.share) {
    navigator.share({
      text: `${Router.query.title || 'Śpiewniki'}`,
      url: Router.asPath,
    })
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(location.href)
    alert('Skopiowano link do schowka!')
  } else {
    alert('Twoja przeglądarka nie obsługuje tej funkcji!')
  }
}

export { shareButton }
