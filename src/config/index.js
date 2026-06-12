const hostname = window.location.hostname

const server = hostname.includes('qixing.win') 
  ? 'https://qixing.win' 
  : 'https://7star.win'

export { server	}