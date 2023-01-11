const Book = require("./models/book");
const Author = require("./models/author");
const mongoose = require("mongoose");

require("dotenv").config();
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connecting to MongoDB");
    seed();
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    genres: ["refactoring"]
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    genres: ["agile", "patterns", "design"]
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    genres: ["refactoring"]
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    genres: ["refactoring", "patterns"]
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    genres: ["refactoring", "design"]
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    genres: ["classic", "crime"]
  },
  {
    title: "The Demon",
    published: 1872,
    author: "Fyodor Dostoevsky",
    genres: ["classic", "revolution"]
  },
];

const authors = [
  {
    name: "Robert Martin",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
  },
  {
    name: "Sandi Metz", // birthyear not known
  }
];

function seed() {
  authors.forEach(async (author) => {
    const a = new Author({
      name: author.name,
      born: author?.born,
    });
    const result = await a.save();
    console.log("created author", result);
  });

  setTimeout(
    () => {
      books.forEach(async (book) => {
        const author = await Author.findOne({ name: book.author }).exec();
        console.log("author id", author);
        const b = new Book({
          title: book.title,
          published: book.published,
          genres: book.genres,
          author: author
        });
        const result = await b.save();
        console.log("created book", result);
      })
    },
    5000
  );
}


/*
In MongoDB shell drop any old databases by running `db.dropDatabase()`.
Then in the terminal run `node seed-database.js`.
The script will hang at the end, so kill it with control-C.
*/
