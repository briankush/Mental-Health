import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const booksTable = document.getElementById("booksTable");
  const resultCount = document.getElementById("resultCount");
  const totalBooksKpi = document.getElementById("totalBooks");

  const modal = document.getElementById("bookModal");
  const openModalBtn = document.getElementById("openModal");
  const closeModalBtn = document.getElementById("closeModal");
  const cancelModalBtn = document.getElementById("cancelModal");
  const bookForm = document.getElementById("bookForm");

  const freeBookCheckbox = document.getElementById("freeBook");
  const priceInput = document.getElementById("bookPrice");
  const pdfFile = document.getElementById("pdfFile");
  const coverFile = document.getElementById("coverFile");
  const coverPreview = document.getElementById("coverPreview");
  const pdfZone = document.getElementById("pdfZone");

  const drawer = document.getElementById("bookDrawer");
  const drawerOverlay = document.getElementById("drawerOverlay");
  const closeDrawerBtn = document.getElementById("closeDrawer");

  const mobileMenu = document.getElementById("mobileMenu");
  const sidebar = document.getElementById("sidebar");

  const searchInput = document.getElementById("bookSearch");
  const typeFilter = document.getElementById("typeFilter");
  const statusFilter = document.getElementById("statusFilter");

  let loadedBooks = [];

  // Toast notification helper
  let toastTimer;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // Load books from MongoDB API
  async function loadBooks() {
    if (!booksTable) return;
    try {
      booksTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Loading books library...</td></tr>`;
      const response = await api.get("/books");
      loadedBooks = response.data || [];

      // Update KPI total
      if (totalBooksKpi) {
        totalBooksKpi.textContent = loadedBooks.length;
      }

      renderBooks(loadedBooks);
    } catch (error) {
      console.error("Error loading books:", error);
      booksTable.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red; padding:20px;">Failed to load books: ${error.message}</td></tr>`;
    }
  }

  // Render books to table
  function renderBooks(books) {
    if (!booksTable) return;

    if (books.length === 0) {
      booksTable.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No books found. Click "Add new book" to create one!</td></tr>`;
      if (resultCount) resultCount.textContent = "Showing 0 results";
      return;
    }

    booksTable.innerHTML = books
      .map((book) => {
        const isFree = Number(book.price) === 0;
        const priceDisplay = isFree ? "Free" : `KES ${book.price}`;
        const typeBadge = isFree
          ? `<span class="badge badge-free">Free</span>`
          : `<span class="badge badge-paid">Paid</span>`;

        return `
          <tr
            data-id="${book._id}"
            data-title="${escapeHtml(book.bookName)}"
            data-type="${isFree ? "free" : "paid"}"
            data-status="published"
            data-book="${escapeHtml(book.bookName)}"
            data-author="${escapeHtml(book.author || "MindfulPath Editorial")}"
            data-category="${escapeHtml(book.category || "Mental Health")}"
            data-price="${priceDisplay}"
            data-description="${escapeHtml(book.description || "")}"
            data-pdf="${book.pdfUrl || ""}"
          >
            <td>
              <div class="book-cell">
                <div class="book-cover">
                  ♧
                </div>
                <div>
                  <div class="book-name">${escapeHtml(book.bookName)}</div>
                  <div class="book-author">${escapeHtml(book.author || "MindfulPath Editorial")}</div>
                </div>
              </div>
            </td>
            <td>${escapeHtml(book.category || "Mental Health")}</td>
            <td>${priceDisplay}</td>
            <td>${typeBadge}</td>
            <td>
              <span class="status status-published">
                <span class="status-dot"></span>
                Published
              </span>
            </td>
            <td>
              ${
                book.pdfUrl
                  ? `<a href="${book.pdfUrl}" target="_blank" rel="noopener noreferrer" class="pdf">PDF ↗</a>`
                  : `<span>No PDF</span>`
              }
            </td>
            <td>
              <button class="action preview-book" type="button" title="View details">⋯</button>
            </td>
          </tr>
        `;
      })
      .join("");

    if (resultCount) {
      resultCount.textContent = `Showing ${books.length} book${books.length === 1 ? "" : "s"}`;
    }

    // Attach click handlers to preview buttons
    document.querySelectorAll(".preview-book").forEach((button) => {
      button.addEventListener("click", function () {
        const row = this.closest("tr");
        if (!row) return;

        document.getElementById("drawerTitle").textContent = row.dataset.book;
        document.getElementById("drawerAuthor").textContent = row.dataset.author;
        document.getElementById("drawerCategory").textContent = row.dataset.category;
        document.getElementById("drawerPrice").textContent = row.dataset.price;

        const descElem = document.querySelector(".drawer-description");
        if (descElem) {
          descElem.textContent = row.dataset.description || "A practical mental health resource from MindfulPath.";
        }

        const viewPdfBtn = document.querySelector(".view-btn");
        if (viewPdfBtn) {
          viewPdfBtn.onclick = () => {
            if (row.dataset.pdf) {
              window.open(row.dataset.pdf, "_blank");
            } else {
              showToast("No PDF URL available for this book.");
            }
          };
        }

        drawer.classList.add("open");
        drawerOverlay.classList.add("open");
      });
    });
  }

  // Modal Open/Close Controls
  function openBookModal() {
    if (modal) {
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeBookModal() {
    if (modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
      if (bookForm) bookForm.reset();
      if (coverPreview) coverPreview.innerHTML = "▧";
      if (pdfZone) {
        pdfZone.querySelector(".upload-title").textContent = "Drop your PDF here";
        pdfZone.querySelector(".upload-text").innerHTML = "<strong>Browse files</strong> or drag and drop";
      }
    }
  }

  if (openModalBtn) openModalBtn.addEventListener("click", openBookModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeBookModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeBookModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeBookModal();
    });
  }

  // Drawer Close Controls
  function closeBookDrawer() {
    if (drawer) drawer.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("open");
  }

  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", closeBookDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeBookDrawer);

  // Free Book Checkbox Toggle
  if (freeBookCheckbox && priceInput) {
    freeBookCheckbox.addEventListener("change", function () {
      if (this.checked) {
        priceInput.value = "0";
        priceInput.disabled = true;
      } else {
        priceInput.disabled = false;
        priceInput.value = "";
      }
    });
  }

  // Cover Preview
  if (coverFile && coverPreview) {
    coverFile.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        coverPreview.innerHTML = `<img src="${e.target.result}" alt="Cover preview">`;
      };
      reader.readAsDataURL(file);
    });
  }

  // PDF Display & Drag/Drop
  if (pdfFile && pdfZone) {
    pdfFile.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        showToast("Please select a valid PDF file.");
        this.value = "";
        return;
      }

      pdfZone.querySelector(".upload-title").textContent = file.name;
      pdfZone.querySelector(".upload-text").textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      pdfZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        pdfZone.classList.add("dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      pdfZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        pdfZone.classList.remove("dragging");
      });
    });

    pdfZone.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        showToast("Only PDF files are allowed.");
        return;
      }

      pdfFile.files = e.dataTransfer.files;
      pdfFile.dispatchEvent(new Event("change"));
    });
  }

  // Handle Form Submission -> POST /api/books
  if (bookForm) {
    bookForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("bookTitle")?.value.trim();
      const author = document.getElementById("bookAuthor")?.value.trim() || "MindfulPath Editorial";
      const category = document.getElementById("bookCategory")?.value || "Mental Health";
      const description = document.getElementById("bookDescription")?.value.trim() || "";
      const isFree = freeBookCheckbox?.checked;
      const priceVal = isFree ? 0 : priceInput?.value;
      const pdf = pdfFile?.files[0];

      if (!title) {
        showToast("Please enter the book title.");
        return;
      }

      if (!isFree && (priceVal === "" || isNaN(priceVal) || priceVal < 0)) {
        showToast("Please enter a valid price.");
        return;
      }

      if (!pdf) {
        showToast("Please upload the book PDF file.");
        return;
      }

      const submitBtn = bookForm.querySelector("button[type='submit']");
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Uploading...";
        }

        const formData = new FormData();
        formData.append("bookName", title);
        formData.append("author", author);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("price", priceVal);
        formData.append("pdf", pdf);

        const result = await api.postFormData("/books", formData);

        showToast(result.message || "Book uploaded successfully!");

        setTimeout(() => {
          closeBookModal();
          loadBooks();
        }, 1200);
      } catch (error) {
        console.error("Book Upload Error:", error);
        showToast(error.message || "Failed to upload book.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Upload book";
        }
      }
    });
  }

  // Filtering + Searching logic
  function filterBooks() {
    const search = searchInput?.value.toLowerCase().trim() || "";
    const type = typeFilter?.value || "";
    const status = statusFilter?.value || "";

    const filtered = loadedBooks.filter((book) => {
      const titleMatch = !search || book.bookName.toLowerCase().includes(search);
      const isFree = Number(book.price) === 0;
      const typeMatch = !type || (type === "free" && isFree) || (type === "paid" && !isFree);
      // Status match (defaults to published)
      const statusMatch = !status || status === "published";

      return titleMatch && typeMatch && statusMatch;
    });

    renderBooks(filtered);
  }

  if (searchInput) searchInput.addEventListener("input", filterBooks);
  if (typeFilter) typeFilter.addEventListener("change", filterBooks);
  if (statusFilter) statusFilter.addEventListener("change", filterBooks);

  // Mobile menu toggle
  if (mobileMenu && sidebar) {
    mobileMenu.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // HTML Escape helper
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Initial load
  loadBooks();
});
