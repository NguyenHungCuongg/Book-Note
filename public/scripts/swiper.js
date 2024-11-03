const swiper = new Swiper('.swiper', {
  loop: true,
  spaceBetween: 24,
  grabCursor: true,
  slidesPerView: 'auto',
  centeredSlides: 'true',

  autoplay:{
    delay: 3000,
    disableOnInteraction: false,
  },

  speed: 800,

  breakpoints:{
    1220: {
    }
  },

  pagination: {
    el: '.swiper-pagination',
  },

  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});