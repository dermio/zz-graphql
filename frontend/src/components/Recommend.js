// import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { USER } from "../queries";

const Recommend = ({ show }) => {
  const user = useQuery(USER);
  // const [favoriteGenre, setFavoriteGenre] = useState("");

  /* Need to:
  - Get books and filter by genre to show user's favorite genres.
  1. Get user data with only useQuery.
  OR
  2. Get user data with useQuery, useState, and useEffect.
  */

  /*  */
  // useEffect(() => {
  //   console.log("useEffect favorite genre")
  //   if (user.data) {
  //     setFavoriteGenre(user.data?.me?.favoriteGenre);
  //     console.log("user.data", user.data);
  //   } 
  // }, [user.data]);

  console.log(user);

  if (!show || !user.data) {
    return null;
  }

  if (user.loading) {
    return <div>loading...</div>;
  }

  const favoriteGenre = user.data?.me?.favoriteGenre;
  console.log("User favrorite genre", user.data);

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre{" "}
        <span style={{fontWeight: "bold"}}>{favoriteGenre}</span>
      </p>
    </div>
  );
};

export default Recommend;
