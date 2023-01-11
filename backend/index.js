const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError
} = require("apollo-server");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

require("dotenv").config();
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connecting to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const typeDefs = gql`
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      born: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) { // Author & genre args are NOT passed.
        console.log("[[[ allBooks author and genre args are NOT passed ]]]");
        return Book.find({}).populate("author");
      }

      if (args.author && args.genre) { // The author and genre args are passed.
        console.log("[[[ allBooks author and genre args are passed ]]]");
        const foundAuthor = await Author.findOne({ name: args.author });
        console.log("[[[ foundAuthor ]]]", foundAuthor);

        /* If the author name does not exist, findOne() returns null instead
        of an object. The expression `foundAuthor.id` returns an error
        because a null object does not have any properties. */
        if (foundAuthor === null) return [];

        // Found book genre and author.
        return await Book
          .find({
            genres: { $in: [args.genre] },
            author: foundAuthor.id
          })
          .populate("author");
      }

      if (args.author) { // The author arg is passed.
        console.log("[[[ allBooks author arg is passed ]]]");
        const foundAuthor = await Author.findOne({ name: args.author });
        console.log("[[[ foundAuthor ]]]", foundAuthor);

        /* If the author name does not exist, findOne() returns null instead
        of an object. The expression `foundAuthor.id` returns an error
        because a null object does not have any properties. */
        if (foundAuthor === null) return [];

        // Found author.
        return await Book
          .find({ author: foundAuthor })
          .populate("author");
      }

      if (args.genre) { // The genre arg is passed.
        console.log("[[[ allBooks genre arg is passed ]]]");

        // Found book genre.
        return await Book
          .find({ genres: { $in: [args.genre] }})
          .populate("author");
      }
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => context.currentUser
  },
  Author: {
    bookCount: async (root) => {
      const foundAuthor = await Author.findOne({ name: root.name });
      console.log(foundAuthor);

      const foundBooks = await Book.find({ author: foundAuthor.id });
      console.log(`Books of ${foundAuthor.name}`, foundBooks);

      return foundBooks.length;
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      console.log("[[[ addBook mutation args ]]]", args);

      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      const foundBook = await Book.findOne({ title: args.title });
      const foundAuthor = await Author.findOne({ name: args.author });

      console.log("[[[ foundAuthor ]]]", foundAuthor);

      // Book title exists in `books` collection.
      if (foundBook) {
        console.log("[[[ Book title exists. Title must be unique. ]]]");
        throw new UserInputError("Title must be unique", {
          invalidArgs: args.title
        });
      }

      /* Author exists in `authors` collection. The author object is also
      referenced in a book object in the `books` collection. */
      if (foundAuthor) {
        console.log("[[[ Author name exists ]]]");

        const newBook = new Book({
          title: args.title,
          author: foundAuthor,
          published: args.published,
          genres: args.genres
        });

        try {
          return await newBook.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          });
        }
      }

      // Author does NOT exist in MongoDB `books` and `authors` collection.
      const newAuthor = new Author({ name: args.author });
      const newBook = new Book({
        title: args.title,
        author: newAuthor,
        published: args.published,
        genres: args.genres
      });

      console.log("newAuthor", newAuthor);
      console.log("newBook", newBook);

      /* Add new author to `authors` collection, and add new book
      to `books` collection. */
      try {
        await newAuthor.save();
        return await newBook.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }
    },
    editAuthor: async (root, args, context) => {
      console.log("[[[ editAuthor mutation ]]]");
      console.log("[[[ args ]]]", args);

      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      const foundAuthor = await Author.findOne({ name: args.name });
      console.log("[[[ foundAuthor ]]]", foundAuthor);

      // If the author name does not exist throw an error.
      if (!foundAuthor) {
        throw new UserInputError("Author does not exist", {
          invalidArgs: args.name
        });
      }

      try {
        foundAuthor.born = args.born;
        return await foundAuthor.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      });

      try {
        return await user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      /* For simplicity's sake, let's assume that all users have
      the same password which is hardcoded to the system. */
      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id
      };
      return { value: jwt.sign(userForToken, JWT_SECRET) };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  }
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
