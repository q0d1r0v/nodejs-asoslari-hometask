const http = require("http");
const fs = require("fs");

const readBooks = () => {
  const data = fs.readFileSync("./database/books.json");
  return JSON.parse(data);
};

const writeBooks = (books) => {
  fs.writeFileSync("./database/books.json", JSON.stringify(books, null, 2));
};

const server = http.createServer((req, res) => {
  const urlParts = req.url.split("/");
  const method = req.method;

  if (method === "GET" && urlParts[1] === "books" && urlParts.length === 2) {
    const books = readBooks();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(books));
  } else if (
    method === "GET" &&
    urlParts[1] === "books" &&
    urlParts.length === 3
  ) {
    const id = parseInt(urlParts[2]);
    const books = readBooks();
    const book = books.find((b) => b.id === id);

    if (book) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(book));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Ma'lumot topilmadi" }));
    }
  } else if (method === "POST" && urlParts[1] === "books") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const newBook = JSON.parse(body);
      const books = readBooks();

      const newId =
        books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;

      const existingBook = books.find((b) => b.title === newBook.title);
      if (existingBook) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Bu kitob bazada mavjud" }));
        return;
      }

      newBook.id = newId;
      books.push(newBook);
      writeBooks(books);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newBook));
    });
  } else if (
    method === "PUT" &&
    urlParts[1] === "books" &&
    urlParts.length === 3
  ) {
    const id = parseInt(urlParts[2]);
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const updatedData = JSON.parse(body);
      const books = readBooks();
      const bookIndex = books.findIndex((b) => b.id === id);

      if (bookIndex !== -1) {
        books[bookIndex] = { ...books[bookIndex], ...updatedData };
        writeBooks(books);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(books[bookIndex]));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Ma'lumot topilmadi" }));
      }
    });
  } else if (
    method === "DELETE" &&
    urlParts[1] === "books" &&
    urlParts.length === 3
  ) {
    const id = parseInt(urlParts[2]);
    const books = readBooks();
    const bookIndex = books.findIndex((b) => b.id === id);

    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      writeBooks(books);
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Ma'lumot topilmadi" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Yo'l topilmadi" }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
