import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ALL_AUTHORS, ALL_BOOKS, ADD_BOOK } from "../queries";

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }],
    onError: (error) => {
      props.setError(error.graphQLErrors[0].message);
    }
  });

  if (!props.show) {
    return null;
  }

  const submit = (event) => {
    event.preventDefault();

    /* If the user does not enter a number in the `published` input field,
    the `onChange` function is not called and the `published` value remains
    an empty string. This causes an error: `Variable "$published" got invalid
    value ""; Int cannot represent non-integer value: ""`. Using parseInt()
    on the `published` value empty string results in NaN. To fix this Number()
    is passed the `published` value which changes the empty string to
    the integer 0. */
    addBook({
      variables: {
        title,
        author,
        published: Number(published),
        genres
      }
    });
    console.log("add book...");

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
