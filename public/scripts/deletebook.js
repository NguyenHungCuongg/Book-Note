const deleteBookForms = document.querySelectorAll(".deleteBookForm");
deleteBookForms.forEach((form) => {
  form.addEventListener("submit",async (event) => {
    event.preventDefault(); 
    const bookId = event.target.dataset.bookId;
    console.log(`Attempting to delete book with ID: ${bookId}`);
    try {
      const response = await fetch(`/deletebook/${bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json(); //Lấy kết quả json được trả về từ app.post("/deletebook/:id",...) bên index.js
      if (result.success) { //tức nếu result.status === 200;
        console.log("Book successfully deleted:", result.book);
        document.getElementById(`Mybook_item-${bookId}`).remove(); // Xóa sách khỏi giao diện

        const remainingBooks = document.querySelectorAll('.Mybook_item');
        if (remainingBooks.length === 0) {
          document.querySelector('#Mybook_collection').innerHTML = await fetch('/empty')
          .then(response => response.text())
          .catch(error => console.error("Failed to load empty content", error));
        }
      } else {
        throw new Error("Failed to delete book");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  });
});



