/** Reset all potential document/root scroll containers to the top. */
export function scrollToTop() {
  const doScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    const root = document.getElementById('root')
    if (root) root.scrollTop = 0
  }

  doScroll()
  requestAnimationFrame(doScroll)
  setTimeout(doScroll, 50)
  setTimeout(doScroll, 150)
}
