function updateRatingValue() {
  const rangeInput = document.getElementById('ratingRange');
  const ratingDisplay = document.getElementById('ratingDisplay');
  ratingDisplay.textContent = rangeInput.value; // Cập nhật giá trị trong <span> bên trong <h3>
}