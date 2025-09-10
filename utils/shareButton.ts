import Router from 'next/router'

const shareButton = () => {
  if (navigator.share) {
    // Use built-in share content menu
    navigator.share({
      text: `${Router.query.title || 'Śpiewniki'}`,
      url: Router.asPath,
    })
  } else if (navigator.clipboard) {
    // Copy url to clipboard
    navigator.clipboard.writeText(location.href)
    alert('Skopiowano link do schowka!')
  } else {
    // Error alert
    alert('Twoja przeglądarka nie obsługuje tej funkcji!')
  }
}

export default shareButton
