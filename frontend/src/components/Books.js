import { useState, useEffect } from "react"; // NEW
import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const [books, setBooks] = useState([]);
  const [displayBooks, setDisplayBooks] = useState([]);
  const [genreType, setGenreType] = useState("all genres");

  useEffect(() => {
    console.log("useEffect query GraphQL");

    if (result.data) {
      setBooks(result.data.allBooks);
      setDisplayBooks(result.data.allBooks);
    }
  }, [result.data]);

  useEffect(() => {
    console.log("useEffect set genreType", genreType);

    if (genreType === "all genres") {
      const noFilterBooks = books;
      console.log("All books, no genre filter", noFilterBooks);
      setDisplayBooks(books);
    }

    if (genreType !== "all genres") {
      const filteredBooks = books.filter((b) => b.genres.includes(genreType));
      console.log("Filtered Books by genreType", filteredBooks);
      setDisplayBooks(filteredBooks);
    }
  }, [genreType, books]);

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  console.log("[[[ books from query ]]]", books);

  const genreButtons = books
    .reduce((acc, book) => acc.concat(book.genres), [])
    .filter((genre, i, arr) => arr.indexOf(genre) === i);

  const filterGenre = (event) => {
    setGenreType(event.target.getAttribute("data-genre"));
  };

  return (
    <div>
      <h2>books</h2>
      {genreType !== "all genres" &&
        <p>in genre <span style={{fontWeight: "bold"}}>{genreType}</span></p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {displayBooks.map((b) => (
            <tr key={b.title} data-genre={b.genres}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genreButtons.map((genre, i) => (
          <button key={i} data-genre={genre} onClick={filterGenre}>
            {genre}
          </button>
        ))}
        <button
          key={"all genres"}
          data-genre={"all genres"}
          onClick={filterGenre}
        >
          All genres
        </button>
      </div>
    </div>
  );
};

export default Books;
