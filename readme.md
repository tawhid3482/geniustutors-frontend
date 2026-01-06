  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  console.log(
    "Auth token:",
    token ? `${token.substring(0, 20)}...` : "No token found"
  );
