//Import Middler
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import { render } from "ejs";

//Initialization
const app = express();
const port = 3000;
const API_key =  "AIzaSyCK86udYmyKgcIhLkOyth52a16k9EYiphQ";
const API_URL = "https://www.googleapis.com/books/v1/volumes";


//Engine Setup
app.set("view engine", "ejs");
app.use(express.static("public"));  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
	user : "postgres",
	host : "localhost",
	database : "booknote",
	password : "123456",
	port : 5432
});
db.connect()
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Connection error', err.stack));

//Main code
app.get("/",async (req,res)=>{
  try{
    const Fiction_Books_Response = await axios.get(`${API_URL}?q=subject:fiction&key=${API_key}&maxResults=10`);
    const Fantasy_Books_Response = await axios.get(`${API_URL}?q=subject:fantasy&key=${API_key}&maxResults=10`);
    const SelfHelp_Books_Response = await axios.get(`${API_URL}?q=subject:self-help&key=${API_key}&maxResults=10`);
    const Education_Books_Response = await axios.get(`${API_URL}?q=subject:education&key=${API_key}&maxResults=10`);
    const Data_Response = {
      Fiction_Books_List : Fiction_Books_Response.data.items,
      Fantasy_Books_List : Fantasy_Books_Response.data.items,
      SelfHelp_Books_List : SelfHelp_Books_Response.data.items,
      Education_Books_List : Education_Books_Response.data.items
    }
    res.render("index.ejs", Data_Response);
  }
  catch(error){
    console.log("Error fetching data for home page", error);
    res.status(500).send("Error fetching data for home page");
  }
})

app.get("/home",async(req,res)=>{
  try{
    res.redirect("/");
  }
  catch(error){
    console.log("Error fetching data for home page", error);
    res.status(500).send("Error fetching data for home page");
  }
})

const MyBookList = [];
async function CreateMyBookList(MyBookList){
  const MyBooks = await db.query('SELECT * FROM books');
  MyBookList.length = 0;
  MyBooks.rows.forEach(book => {  
    MyBookList.push(book);
  });
} 

app.get("/mybook", async(req,res)=>{
  try{
    await CreateMyBookList(MyBookList);
    res.render("mybook.ejs",{MyBookList : MyBookList});
  }
  catch(error){
    console.log("Error fetching data for my book page", error);
    res.status(500).send("Error fetching data for my book page");
  }
})

async function addBookToMyBook(bookId) {
  //Nếu sách đã được chèn
  const checkBook = await db.query('SELECT * FROM books WHERE book_id=$1',[bookId]);
  if(checkBook.rows.length >0){
    return ({success: false, message: "Book already exists"})
  }

  //Nếu sách chưa được chèn
  const selectedBook = await axios.get(`${API_URL}/${bookId}?key=${API_key}`);
  const bookTitle = selectedBook.data.volumeInfo.title;
  const bookAuthor = selectedBook.data.volumeInfo.authors[0];
  const bookDescription = selectedBook.data.volumeInfo.description;
  const bookThumbnail = selectedBook.data.volumeInfo.imageLinks.thumbnail;
  try {
    const result = await db.query(
      'INSERT INTO books (book_id,title,author,description,thumbnail) VALUES($1,$2,$3,$4,$5) RETURNING *'
      ,[bookId,bookTitle,bookAuthor,bookDescription,bookThumbnail]);
    //console.log('Book added:', result.rows[0]); 
    return ({ success: true ,book: result.rows[0]}) 
  } catch (err) {
    console.error('Error adding book', err);
    throw err;
  }
}

app.post("/addbook/:id", async(req,res)=>{
  const bookId = req.params.id;
  try{
    const newBook = await addBookToMyBook(bookId);
    if(newBook.success){
      res.status(200).json({ success: true, book: newBook.book });
    }
    else {
      res.status(409).json({ success: false, message: newBook.message});
    }
  }
  catch(error){
    console.log("Error adding book to my book", error);
    res.status(500).json({ success: false, error: "Error adding book to my book"});
  }
})

async function deleteBookFromMyBook(bookId){
  try {
    // Xóa các review liên quan trước để tránh gặp ràng buộc khóa ngoại
    await db.query('DELETE FROM review WHERE book_id = $1', [bookId]);
    const result = await db.query(
      'DELETE FROM books WHERE (book_id = $1) RETURNING *'
      ,[bookId]);
    //console.log('Book removed:', result.rows[0]); 
    //console.log(bookId);
    return result.rows[0]; 
  } catch (err) {
    console.error('Error removing book', err);
    throw err;
  }
}

app.post("/deletebook/:id", async(req,res)=>{
  const bookId = req.params.id;
  try{
    const deletedBook = await deleteBookFromMyBook(bookId);
    await CreateMyBookList(MyBookList);
    res.status(200).json({ success: true, book: deletedBook });
  }
  catch(error){
    console.log("Error removing book from my book", error);
    res.status(500).json({ success: false, error: "Error removing book from my book"});
  }
})

app.get('/empty', (req, res) => {
  res.render('empty.ejs');
});

app.get('/search',async (req,res)=>{
  const searchInput = req.query.input; //Thuộc tính .query là của Express.js, còn .body là của Body-parser.
  const SearchBookList = await axios.get(`${API_URL}?q=${searchInput}&key=${API_key}&maxResults=40`);
  const Data_Response = {SearchBookList: SearchBookList.data.items};
  try{
    res.render("search.ejs", Data_Response);
  }
  catch(error){
    console.log(`Error searching for "${searchInput}"`);
    res.status(500).send(`Error searching for "${searchInput}"`);
  }
})

app.get('/viewnote/:id', async(req,res)=>{
  const bookId = req.params.id;
  const reviewBook = await axios.get(`${API_URL}/${bookId}?key=${API_key}`);
  const myNoteBook = await db.query('SELECT * FROM review WHERE book_id = $1 AND user_id = $2', [bookId, 1]);
  const note = myNoteBook.rows.length > 0 ? myNoteBook.rows[0] : null;
  const Data_Response = {
    reviewBook : reviewBook.data,
    userReview : note
  };
  try{
    res.render("viewnote.ejs", Data_Response);
  }
  catch(error){
    console.log("Error fetching data for this book's note", error);
    res.status(500).send("Error fetching data for this book's note");
  }
})

async function createBookNote(bookId,noteContent,rating){
  try {
    // Kiểm tra xem bản ghi đã tồn tại chưa
    const checkNote = await db.query(
      'SELECT * FROM review WHERE book_id = $1 AND user_id = $2',
      [bookId, 1]
    );

    if (checkNote.rows.length > 0) {
      // Nếu đã tồn tại, sử dụng lệnh UPDATE
      const result = await db.query(
        'UPDATE review SET rating = $1, note = $2 WHERE book_id = $3 AND user_id = $4 RETURNING *',
        [rating, noteContent, bookId, 1]
      );
      return { success: true, note: result.rows[0] };
    } else {
      // Nếu chưa có, sử dụng lệnh INSERT
      const result = await db.query(
        'INSERT INTO review (user_id, book_id, rating, note) VALUES($1, $2, $3, $4) RETURNING *',
        [1, bookId, rating, noteContent]
      );
      return { success: true, note: result.rows[0] };
    }
  } catch (err) {
    console.error('Error creating or updating note', err);
    throw err;
  }
}

app.post('/editnote/:id',async(req,res)=>{
  const bookId = req.params.id;
  const noteContent = req.body.noteContent;
  const rating = req.body.rating;
  try{
    const editedNote = await createBookNote(bookId,noteContent,rating);
    res.redirect(`/viewnote/${bookId}`);
  }
  catch(error){
    console.log("Error editing note from my book", error);
    res.status(500).json({ success: false, error: "Error editing note from my book"});
  }
})

app.listen(port,()=>{
  console.log("Server is running on port " + port);
});