import Router from 'next/router'

const share = () => {
  if (navigator.share) {
    // share content
    navigator.share({
      text: `${Router.query.title || 'Śpiewniki'}`,
      url: Router.asPath,
    })
  } else if (navigator.clipboard) {
    // copy to clipboard
    navigator.clipboard.writeText(location.href)
    alert('Skopiowano link do schowka!')
  } else {
    // error alert
    alert('Twoja przeglądarka nie obsługuje tej funkcji!')
  }
}

export default share
