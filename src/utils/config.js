let server
const hostname = window.location.hostname

if (hostname.includes('7star.win')) {
  server = 'https://7star.win'
} else if (hostname.includes('qixing.win')) {
  server = 'https://qixing.win'
} else {
  server = 'https://7star.win'
}


export { server	}