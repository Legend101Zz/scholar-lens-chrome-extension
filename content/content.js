class PaperExtractor {
  constructor() {
    this.setupObserver();
    this.extractCurrentPage();
  }

  setupObserver() {
    const observer = new MutationObserver(() => this.extractCurrentPage());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  extractCurrentPage() {
    if (window.location.hostname.includes("scholar.google.com")) {
      this.extractScholarPage();
    } else if (document.contentType === "application/pdf") {
      this.extractPDFContent();
    }
  }

  extractScholarPage() {
    const papers = Array.from(document.querySelectorAll(".gs_ri")).map(
      (paper) => ({
        title: paper.querySelector(".gs_rt")?.textContent,
        authors: paper.querySelector(".gs_a")?.textContent,
        abstract: paper.querySelector(".gs_rs")?.textContent,
        citations: paper
          .querySelector(".gs_fl")
          ?.textContent.match(/Cited by (\d+)/)?.[1],
      })
    );

    if (papers.length > 0) {
      chrome.runtime.sendMessage({
        type: "EXTRACT_PAPER",
        data: { papers },
      });
    }
  }

  async extractPDFContent() {
    // Basic PDF text extraction - to be made better ,
    // we'd want to use a PDF parsing library , so need to search for that
    const text = document.body.textContent;
    chrome.runtime.sendMessage({
      type: "EXTRACT_PAPER",
      data: { content: text },
    });
  }
}

new PaperExtractor();
