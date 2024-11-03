let currentIndex = 0;
const items = document.querySelectorAll('.Carousel_item');
const totalItems = items.length;
function showNextImage() {
  items[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + 1) % totalItems;  
  items[currentIndex].classList.add('active');     
}
setInterval(showNextImage, 5000); 