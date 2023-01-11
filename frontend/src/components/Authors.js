import { useQuery } from "@apollo/client";
import { ALL_AUTHORS } from "../queries";

import { useState } from "react";
import AuthorYearForm from "./AuthorYearForm";

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const [errorMessage, setErrorMessage] = useState(null);

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }
  const authors = result.data.allAuthors;

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AuthorYearForm setError={notify} />
      <Notify errorMessage={errorMessage} />
    </div>
  );
};

export default Authors;

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }
  return <div style={{ color: "red" }}>{errorMessage}</div>;
};
