export default new class Nyaa {
  base = 'https://nyaa.si'

  async single({ titles, episode }) {
    if (!titles?.length) return []
    return this.search(titles[0], episode)
  }
  batch = this.single
  movie = this.single

  async search(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`

    const url = `${this.base}/?page=rss&c=1_2&f=0&q=${encodeURIComponent(query)}`
    const res = await fetch(url)
    const text = await res.text()

    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'application/xml')
    const items = [...xml.querySelectorAll('item')]

    return items.map(item => {
      const magnet = item.querySelector('link')?.nextSibling?.nodeValue?.trim()
        || item.getElementsByTagNameNS('*', 'magnetUri')?.[0]?.textContent
        || ''

      return {
        title: item.querySelector('title')?.textContent || '',
        link: magnet,
        hash: magnet?.match(/btih:([A-Fa-f0-9]+)/i)?.[1] || '',
        seeders: Number(item.getElementsByTagNameNS('*', 'seeders')?.[0]?.textContent || 0),
        leechers: Number(item.getElementsByTagNameNS('*', 'leechers')?.[0]?.textContent || 0),
        downloads: Number(item.getElementsByTagNameNS('*', 'downloads')?.[0]?.textContent || 0),
        size: Number(item.getElementsByTagNameNS('*', 'size')?.[0]?.textContent || 0),
        date: new Date(item.querySelector('pubDate')?.textContent || ''),
        accuracy: 'medium',
        type: 'alt'
      }
    })
  }

  async test() {
    const res = await fetch(`${this.base}/?page=rss&q=one+piece&c=1_2&f=0`)
    return res.ok
  }
}()
