class SidePanel {
  constructor() {
    this.currentTab = "summary";
    this.setupEventListeners();
    this.setupMessageListener();
  }

  setupEventListeners() {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => this.switchTab(tab.dataset.tab));
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "PAPER_ANALYZED") {
        this.updateContent(message.data);
      }
    });
  }

  switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.remove("active");
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    document.getElementById(tabName).classList.add("active");
    this.currentTab = tabName;
  }

  updateContent(data) {
    if (data.summary) {
      document.querySelector(".summary-content").innerHTML = marked.parse(
        data.summary
      );
    }
    if (data.methodology) {
      document.querySelector(".methodology-content").innerHTML = marked.parse(
        data.methodology
      );
    }
    if (data.citations) {
      this.updateCitations(data.citations);
    }
    document.querySelector(".loading").hidden = true;
  }

  updateCitations(citations) {
    const citationsHtml = citations
      .map(
        (citation) => `
        <div class="citation-card">
          <h3>${citation.title}</h3>
          <p>${citation.authors}</p>
          <p>Cited by: ${citation.citedBy}</p>
        </div>
      `
      )
      .join("");
    document.querySelector(".citations-content").innerHTML = citationsHtml;
  }
}

new SidePanel();
