import { useState, useEffect } from "react";
import { useApolloClient } from "@apollo/client";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";

const App = () => {
  const [page, setPage] = useState("authors");
  const [errorMessage, setErrorMessage] = useState(null);
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  /* If the user logs in and refreshes the page, the app behaves as if the user
  did not login and hides the `AuthorYearForm` and `NewBook` forms and shows
  the wrong buttons. However, the page refresh does not delete the user token
  from `localStorage` because the user did not logout. To fix this behavior,
  the useEffect runs once and checks `localstorage` for the user token
  from login. If the user token exists the app saves the token to state.
  Now a page refresh will not hide the `AuthorYearForm` and `NewBook`forms
  or show the wrong buttons. */
  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("books-authors-user-token");
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
    }
  }, []);

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();

    /* After logging out, if on the `Authors` page, stay on the `Authors` page
    but hide the `AuthorYearForm`. If on the `Books` page, stay on the `Books`
    page. If on the add `NewBook` page, show the default `Authors` page. */
    if (page === "add") {
      setPage("authors");
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>
      <Notify errorMessage={errorMessage} />

      <Authors show={page === "authors"} token={token} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} setError={notify} />

      <LoginForm
        setToken={setToken}
        setError={notify}
        show={page === "login"}
        setPage={setPage}
      />
    </div>
  );
};

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "red" }}>{errorMessage}</div>;
};

export default App;
