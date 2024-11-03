const form = document.querySelector(".editNoteForm");
form.addEventListener("submit", async (event) => {
  event.preventDefault(); 
  const bookId = event.target.dataset.bookId;
  const noteContent = event.target.querySelector('textarea[name="noteContent"]').value;
  const rating = event.target.querySelector('input[name="rating"]').value;

  try {
    const response = await fetch(`/editnote/${bookId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteContent, rating })
    });

    if (response.ok) {
      // Nếu yêu cầu thành công, làm mới lại trang
      window.location.href = `/viewnote/${bookId}`;
    } else {
      console.error("Failed to save changes");
    }
  } catch (error) {
    console.error("Error editing note:", error);
  }
});


