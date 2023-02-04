import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_BIRTH_YEAR } from "../queries";

const AuthorYearForm = (props) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const result = useQuery(ALL_AUTHORS);

  const [changeBirthYear] = useMutation(EDIT_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      props.setError(error.graphQLErrors[0].message);
    }
  });

  useEffect(() => {
    /* Need to run this hook once after the initial render because the `name`
    state is set to an empty string "". The default `name` needs to be set
    to the first author of the authors array. */
    if (name === "") {
      setName(result.data.allAuthors[0].name);
    }
    /* An empty array [] is enough for the code to work. However ESLint
    complains about React Hook useEffect missing dependencies "name"
    and "result.data.allAuthors". The "name" and "result.data.allAuthors"
    dependencies are added to the array to remove the ESLint warnings. */
  }, [name, result.data.allAuthors]);

  if (!props.token) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }
  const authors = result.data.allAuthors;

  const handleChange = (event) => {
    event.preventDefault();
    console.log("[[[ select name ]]] " + event.target.value);

    setName(event.target.value);
  };

  const submit = (event) => {
    event.preventDefault();

    changeBirthYear({ variables: { name, born } });

    // setName("");
    setBorn("");
  };

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        {/* <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div> */}

        <select onChange={handleChange}>
          {authors.map((a) => (
            <option key={a.name} value={a.name}>{a.name}</option>
          ))}
        </select>

        <div>
          born
          <input
            required
            type="number"
            value={born}
            onChange={({ target }) => setBorn(parseInt(target.value))}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default AuthorYearForm;
