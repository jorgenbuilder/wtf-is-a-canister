// Function to determine if a word should be replaced
const shouldReplace = (text: string): boolean => {
  // Ignore technical terms that might contain 'canister' but aren't ICP canisters
  const ignoredTerms = [
    "gas canister",
    "spray canister",
    "oxygen canister",
    "water canister",
    "fuel canister",
    "coffee canister",
    "tea canister",
    "storage canister",
    "food canister",
    "waste canister",
    "aerosol canister",
  ];

  const lowerText = text.toLowerCase();
  return !ignoredTerms.some((term) => lowerText.includes(term));
};

// Function to preserve case when replacing text
const matchCase = (original: string, replacement: string): string => {
  if (original === original.toLowerCase()) return replacement.toLowerCase();
  if (original === original.toUpperCase()) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return (
      replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase()
    );
  }
  return replacement.toLowerCase();
};

// Function to replace text while preserving case
const replaceText = (text: string): string => {
  if (!shouldReplace(text)) return text;

  return text.replace(/\b(canister)(s)?\b/gi, (match, p1, p2) => {
    const base = matchCase(p1, "smart contract");
    return p2 ? base + "s" : base;
  });
};

// Function to process a text node
const processTextNode = (node: Text) => {
  const originalText = node.nodeValue;
  if (!originalText || !originalText.match(/\b(canister)(s)?\b/i)) return;

  const newText = replaceText(originalText);
  if (newText !== originalText) {
    node.nodeValue = newText;
  }
};

// Function to process an element and its children
const processElement = (element: Element) => {
  // Skip script and style elements
  if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(element.tagName)) {
    return;
  }

  // Process child nodes
  const walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  let node: Text | null;
  while ((node = walk.nextNode() as Text | null)) {
    processTextNode(node);
  }
};

// Initial processing
processElement(document.body);

// Set up observer for dynamic content
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processElement(node as Element);
        } else if (node.nodeType === Node.TEXT_NODE) {
          processTextNode(node as Text);
        }
      });
    } else if (mutation.type === "characterData") {
      if (mutation.target.nodeType === Node.TEXT_NODE) {
        processTextNode(mutation.target as Text);
      }
    }
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});

// Log that the script is running
console.log("Canister replacement extension is active");
