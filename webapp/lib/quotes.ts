export const LOADING_QUOTES = [
    { text: "The stock market is designed to transfer money from the Active to the Patient.", author: "Warren Buffett" },
    { text: "In trading, you have to be defensive and aggressive at the same time.", author: "Paul Tudor Jones" },
    { text: "The goal of a successful trader is to make the best trades. Money is secondary.", author: "Alexander Elder" },
    { text: "Markets are never wrong – opinions often are.", author: "Jesse Livermore" },
    { text: "It's not whether you're right or wrong, but how much money you make when you're right.", author: "George Soros" },
    { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
    { text: "Confidence is not 'I will profit on this trade.' Confidence is 'I will be fine if I don't.'", author: "Yvan Byeajee" },
    { text: "Liquidity involves the ability to trade large size quickly at low cost.", author: "Robert Engle" },
    { text: "Time is your friend; impulse is your enemy.", author: "John Bogle" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
];

export function getRandomQuote() {
    return LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)];
}
