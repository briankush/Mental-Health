import { api } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const booksTableBody = document.querySelector(".table-wrap tbody");
  const addBookBtn = document.getElementById("addBookBtn");
  const addBookModal = document.getElementById("addBookModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const addBookForm = document.getElementById("addBookForm");
  const formMessage = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");

  // Fetch and display books
  async function loadBooks() {
    try {
      booksTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Loading books...</td></tr>`;
      const response = await api.get("/books");
      const books = response.data || [];

      if (books.length === 0) {
        booksTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">No books found. Add your first book above!</td></tr>`;
        return;
      }

      booksTableBody.innerHTML = books
        .map(
          (book) => `
        <tr>
          <td><strong>${escapeHtml(book.bookName)}</strong></td>
          <td>KES ${book.price}</td>
          <td>${book.price > 0 ? "Paid" : "Free"}</td>
          <td><span class="status status--ok">Available</span></td>
          <td>
            ${
              book.pdfUrl
                ? `<a href="${book.pdfUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--sm btn--outline">View PDF 📄</a>`
                : `<span style="color:#888;">No PDF</span>`
            }
          </td>
        </tr>
      `
        )
        .join("");
    } catch (error) {
      console.error("Error loading books:", error);
      booksTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red; padding: 20px;">Failed to load books: ${error.message}</td></tr>`;
    }
  }

  // Escape HTML helper
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Modal controls
  if (addBookBtn && addBookModal) {
    addBookBtn.addEventListener("click", () => {
      addBookModal.style.display = "flex";
      formMessage.textContent = "";
      addBookForm.reset();
    });
  }

  if (closeModalBtn && addBookModal) {
    closeModalBtn.addEventListener("click", () => {
      addBookModal.style.display = "none";
    });
  }

  // Close modal when clicking outside modal box
  window.addEventListener("click", (e) => {
    if (e.target === addBookModal) {
      addBookModal.style.display = "none";
    }
  });

  // Handle Add Book Form Submit
  if (addBookForm) {
    addBookForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      formMessage.textContent = "";
      formMessage.style.color = "initial";

      const bookNameInput = document.getElementById("bookName");
      const priceInput = document.getElementById("price");
      const pdfFileInput = document.getElementById("pdfFile");

      const bookName = bookNameInput.value.trim();
      const price = priceInput.value.trim();
      const pdfFile = pdfFileInput.files[0];

      if (!bookName || !price || !pdfFile) {
        formMessage.style.color = "red";
        formMessage.textContent = "Please fill in all fields and select a PDF file.";
        return;
      }

      const formData = new FormData();
      formData.append("bookName", bookName);
      formData.append("price", price);
      formData.append("pdf", pdfFile);

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Uploading to Cloudinary...";

        const result = await api.postFormData("/books", formData);

        formMessage.style.color = "green";
        formMessage.textContent = result.message || "Book and PDF uploaded successfully!";

        addBookForm.reset();
        setTimeout(() => {
          addBookModal.style.display = "none";
          loadBooks();
        }, 1200);
      } catch (error) {
        console.error("Upload error:", error);
        formMessage.style.color = "red";
        formMessage.textContent = error.message || "Failed to upload book.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload Book";
      }
    });
  }

  // Initial load
  loadBooks();
});
