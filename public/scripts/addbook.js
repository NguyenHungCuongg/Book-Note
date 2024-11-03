document.addEventListener('DOMContentLoaded', () => {
  const addBookForms = document.querySelectorAll('.addBookForm');
  addBookForms.forEach(form => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if(response.ok) { // tức response.status===200
          await Showup(successPopup);
        }
        else if(response.status === 409) {
          await Showup(alreadyPopup);
        }
        else {
          throw new Error("Failed to add book");
        }
        const data = await response.json();
      } catch (error) {
        console.error('Error adding book:', error);
        await Showup(failPopup);
      }
    });
  });
});

const successPopup = document.querySelector(".successPopup_container");
const failPopup = document.querySelector(".failPopup_container");
const alreadyPopup = document.querySelector(".alreadyPopup_container");

const Showup = async function(popup){
  popup.classList.remove("hide");
  setTimeout(()=>{
    popup.classList.add("hide");
  },1000);
}
