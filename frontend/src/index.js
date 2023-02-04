import { createRoot } from "react-dom/client";
import App from "./App";

import {
  ApolloClient, ApolloProvider, HttpLink, InMemoryCache
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("books-authors-user-token");
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null
    }
  };
});

const httpLink = new HttpLink({ uri: "http://localhost:4000" });

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink)
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
